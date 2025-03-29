import g from "../bindings/mod.js";
import {getDisplayName} from "../utils/string.ts";
import {handleCallable} from "./callable.ts";
import {handleProp} from "./prop.js";
import {handleSignal} from "./signal.js";

function defineMethods(target, info) {
    const nMethods = g.interface_info.get_n_methods(info);

    for (let i = 0; i < nMethods; i++) {
        const methodInfo = g.interface_info.get_method(info, i);
        handleCallable(target, methodInfo);
    }
}

function defineVFuncs(target, info) {
    const nMethods = g.interface_info.get_n_vfuncs(info);

    for (let i = 0; i < nMethods; i++) {
        const vFuncInfo = g.interface_info.get_vfunc(info, i);
        handleCallable(target, vFuncInfo);
    }
}

function defineSignals(target, info) {
    const nSignals = g.interface_info.get_n_signals(info);

    for (let i = 0; i < nSignals; i++) {
        const signalInfo = g.interface_info.get_signal(info, i);
        handleSignal(target, signalInfo);
    }
}

function defineProps(target, info) {
    const iface = g.type.default_interface_ref(
        Reflect.getOwnMetadata("gi:gtype", target),
    );

    const nProps = g.interface_info.get_n_properties(info);

    for (let i = 0; i < nProps; i++) {
        const propInfo = g.interface_info.get_property(info, i);
        const cName = g.base_info.get_name(propInfo);
        const paramSpecPointer = g.object_interface.find_property(iface, cName);
        handleProp(target, propInfo, paramSpecPointer);
        g.base_info.unref(propInfo);
    }
}

export function createInterface(info, gType) {
    const ObjectClass = class {
    };

    Object.defineProperty(ObjectClass, "name", {
        value: getDisplayName(info),
    });

    Reflect.defineMetadata("gi:gtype", gType, ObjectClass);

    defineMethods(ObjectClass, info);
    defineVFuncs(ObjectClass, info);
    defineSignals(ObjectClass, info);
    defineProps(ObjectClass, info);

    return ObjectClass;
}
