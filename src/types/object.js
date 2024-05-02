import g from "../bindings/mod.js";
import { getName } from "../utils/string.ts";
import { handleCallable, handleStructCallable } from "./callable.js";
import { objectByInfo } from "../utils/gobject.js";
import { handleSignal } from "./signal.js";
import { handleProp } from "./prop.js";
import { GType } from "../bindings/enums.js";

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

function setVFuncs(target) {
  const klass = Object.getPrototypeOf(target.constructor);
  const funcs = Object.getOwnPropertyNames(Object.getPrototypeOf(target))
    .filter((name) => name.startsWith("vfunc_"));

  for (const vfunc of funcs) {
    const name = vfunc.slice(6);
    const value = target[vfunc].bind(target);

    if (!Reflect.has(klass.prototype, vfunc)) {
      throw new Error(`Could not find definition of virtual function ${name}`);
    }

    Reflect.set(klass.prototype, vfunc, value, target);
  }
}

/** @type bigint | null */
let HydratingObject = null;

/**
 * @param {bigint | null} object
 */
export function _setHydratingObject(object) {
  HydratingObject = object;
}

/**
 * An array of GTypes being currently constructed. This is to catch JS objects
 * whose instance_init is called.
 * @type bigint[]
 */
export const ConstructContext = [];

export function createObject(info, gType) {
  const ParentClass = getParentClass(info) ?? Object;

  const ObjectClass = class extends ParentClass {
    constructor(props = {}) {
      super(props);

      if (gType == GType.OBJECT) {
        const klass = this.constructor;

        if (HydratingObject === null) {
          const gType = Reflect.getOwnMetadata("gi:gtype", klass);

          if (!gType) {
            throw new Error("Tried to construct an object without a GType");
          }

          ConstructContext.push(gType);

          Reflect.defineMetadata("gi:ref", g.object.new(gType, null), this);
          Object.entries(props).forEach(([key, value]) => {
            this[key] = value;
          });

          ConstructContext.pop();
        } else {
          Reflect.defineMetadata("gi:ref", HydratingObject, this);

          HydratingObject = null;
        }

        const init_fn = Reflect.getMetadata("gi:instance_init", klass);
        if (init_fn) init_fn.call(this);

        setVFuncs(this);
      }
    }
  };

  Reflect.defineMetadata("gi:gtype", gType, ObjectClass);

  Object.defineProperty(ObjectClass, "name", {
    value: getName(info),
  });

  defineMethods(ObjectClass, info);
  defineVFuncs(ObjectClass, info);
  defineSignals(ObjectClass, info);
  defineProps(ObjectClass, info);
  inheritInterfaces(ObjectClass, info);
  defineClassStructMethods(ObjectClass, info);

  return ObjectClass;
}
