import g from "../bindings/mod.js";
import {getDisplayName} from "../utils/string.ts";
import {handleCallable, handleStructCallable} from "./callable.ts";
import {objectByInfo} from "../utils/gobject.js";
import {handleSignal} from "./signal.js";
import {handleProp} from "./prop.js";
import {GType} from "../bindings/enums.ts";

function getParentClass(info) {
    const parent = g.object_info.get_parent(info);

    if (parent) {
        const ParentClass = objectByInfo(parent);
        g.base_info.unref(parent);

        return ParentClass;
    }
}

function inheritInterfaces(target, info) {
    const nInterfaces = g.object_info.get_n_interfaces(info);
    for (let i = 0; i < nInterfaces; i++) {
        const ifaceInfo = g.object_info.get_interface(info, i);
        const iface = objectByInfo(ifaceInfo);

        for (const key of Object.keys(iface.prototype)) {
            if (Object.hasOwn(target.prototype, key)) {
                continue;
            }

            Object.defineProperty(
                target.prototype,
                key,
                Object.getOwnPropertyDescriptor(iface.prototype, key),
            );
        }

        //Object.assign(target.__signals__, iface.__signals__);
        g.base_info.unref(ifaceInfo);
    }
}

function defineMethods(target, info) {
    const nMethods = g.object_info.get_n_methods(info);

    for (let i = 0; i < nMethods; i++) {
        const methodInfo = g.object_info.get_method(info, i);
        handleCallable(target, methodInfo);
    }
}

function defineVFuncs(target, info) {
    const nMethods = g.object_info.get_n_vfuncs(info);

    for (let i = 0; i < nMethods; i++) {
        const vFuncInfo = g.object_info.get_vfunc(info, i);
        handleCallable(target, vFuncInfo);
    }
}

function defineSignals(target, info) {
    const nSignals = g.object_info.get_n_signals(info);

    for (let i = 0; i < nSignals; i++) {
        const signalInfo = g.object_info.get_signal(info, i);
        handleSignal(target, signalInfo);
    }
}

function defineProps(target, info) {
    const klass = g.type_class.ref(Reflect.getOwnMetadata("gi:gtype", target));

    const nProps = g.object_info.get_n_properties(info);

    for (let i = 0; i < nProps; i++) {
        const propInfo = g.object_info.get_property(info, i);
        const cName = g.base_info.get_name(propInfo);
        const paramSpecPointer = g.object_class.find_property(klass, cName);
        handleProp(target, propInfo, paramSpecPointer);
        g.base_info.unref(propInfo);
    }
}

function defineClassStructMethods(target, info) {
    const structInfo = g.object_info.get_class_struct(info);

    if (!structInfo) {
        return;
    }

    const nMethods = g.struct_info.get_n_methods(structInfo);

    for (let i = 0; i < nMethods; i++) {
        const methodInfo = g.struct_info.get_method(structInfo, i);
        handleStructCallable(target, methodInfo);
    }
}

export function createObject(info, gType) {
    const ParentClass = getParentClass(info) ?? Object;

    const ObjectClass = class extends ParentClass {
        constructor(props = {}) {
            super(props);

            if (gType == GType.OBJECT) {
                const gType = Reflect.getOwnMetadata("gi:gtype", this.constructor);

                if (!gType) {
                    throw new Error("Tried to construct an object without a GType");
                }

                Reflect.defineMetadata("gi:ref", g.object.new(gType, null), this);
                Object.entries(props).forEach(([key, value]) => {
                    this[key] = value;
                });
            }
        }
    };

    Reflect.defineMetadata("gi:gtype", gType, ObjectClass);

    Object.defineProperty(ObjectClass, "name", {
        value: getDisplayName(info),
    });

    defineMethods(ObjectClass, info);
    defineVFuncs(ObjectClass, info);
    defineSignals(ObjectClass, info);
    defineProps(ObjectClass, info);
    inheritInterfaces(ObjectClass, info);
    defineClassStructMethods(ObjectClass, info);

    return ObjectClass;
}
