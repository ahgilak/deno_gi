import g from "../bindings/mod.js";
import { getName } from "../utils/string.ts";
import { handleCallable, handleStructCallable } from "./callable.js";
import { objectByGType } from "../utils/gobject.js";
import { GConnectFlags } from "../bindings/enums.js";
import { createCallback } from "./callback.js";
import { handleSignal } from "./signal.js";
import { handleProp } from "./prop.js";

function extendObject(target, info) {
  const parent = g.object_info.get_parent(info);

  if (parent) {
    const gType = g.registered_type_info.get_g_type(parent);

    const ParentClass = objectByGType(gType);
    Object.setPrototypeOf(target.prototype, ParentClass.prototype);
    //Object.assign(target.__signals__, ParentClass.__signals__);

    g.base_info.unref(parent);
  }
}

function inheritInterfaces(target, info) {
  const nInterfaces = g.object_info.get_n_interfaces(info);
  for (let i = 0; i < nInterfaces; i++) {
    const ifaceInfo = g.object_info.get_interface(info, i);
    const ifaceGType = g.registered_type_info.get_g_type(ifaceInfo);
    const iface = objectByGType(ifaceGType);

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
  const ObjectClass = class {
    constructor(props = {}) {
      Reflect.defineMetadata("gi:ref", g.object.new(gType, null), this);
      Object.entries(props).forEach(([key, value]) => {
        this[key] = value;
      });
    }

    connect(action, callback) {
      const signalInfo = Reflect.getMetadata(
        "gi:signals",
        ObjectClass,
        action.split("::")[0],
      );

      const cb = createCallback(signalInfo, callback, this);
      const handler = g.signal.connect_data(
        Reflect.getOwnMetadata("gi:ref", this),
        action,
        cb.pointer,
        null,
        null,
        GConnectFlags.SWAPPED,
      );

      return handler;
    }

    disconnect(handler) {
      g.signal.handler_disconnect(
        Reflect.getOwnMetadata("gi:ref", this),
        handler,
      );
    }

    emit(action) {
      g.signal.emit_by_name(
        Reflect.getOwnMetadata("gi:ref", this),
        action,
      );
    }

    on(action, callback) {
      return this.connect(action, callback);
    }

    once(action, callback) {
      const handler = this.connect(action, (...args) => {
        callback(...args);
        this.off(handler);
      });

      return handler;
    }

    off(handler) {
      return this.disconnect(handler);
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
  extendObject(ObjectClass, info);
  inheritInterfaces(ObjectClass, info);
  defineClassStructMethods(ObjectClass, info);

  return ObjectClass;
}
