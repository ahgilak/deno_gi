import g from "../bindings/mod.ts";
import { getName } from "../utils/string.ts";
import { handleCallable } from "./callable.ts";
import { objectByGType } from "../utils/gobject.js";
import { GConnectFlags } from "../bindings/enums.ts";
import { createCallback } from "./callback.ts";
import { handleSignal } from "./signal.ts";
import { handleProp } from "./prop.ts";

function extendObject(target: any, info: Deno.PointerValue) {
  const parent = g.object_info.get_parent(info);

  if (parent) {
    const gType = g.registered_type_info.get_g_type(parent);

    const ParentClass = objectByGType(gType);
    Object.setPrototypeOf(target.prototype, ParentClass.prototype);
    //Object.assign(target.__signals__, ParentClass.__signals__);

    g.base_info.unref(parent);
  }
}

function inheritInterfaces(target: any, info: Deno.PointerValue) {
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
        Object.getOwnPropertyDescriptor(iface.prototype, key)!,
      );
    }

    //Object.assign(target.__signals__, iface.__signals__);
    g.base_info.unref(ifaceInfo);
  }
}

function defineMethods(target: any, info: Deno.PointerValue) {
  const nMethods = g.object_info.get_n_methods(info);

  for (let i = 0; i < nMethods; i++) {
    const methodInfo = g.object_info.get_method(info, i);
    handleCallable(target, methodInfo);
  }
}

function defineVFuncs(target: any, info: Deno.PointerValue) {
  const nMethods = g.object_info.get_n_vfuncs(info);

  for (let i = 0; i < nMethods; i++) {
    const vFuncInfo = g.object_info.get_vfunc(info, i);
    handleCallable(target, vFuncInfo);
  }
}

function defineSignals(target: any, info: Deno.PointerValue) {
  const nSignals = g.object_info.get_n_signals(info);

  for (let i = 0; i < nSignals; i++) {
    const signalInfo = g.object_info.get_signal(info, i);
    handleSignal(target, signalInfo);
  }
}

function defineProps(target: any, info: Deno.PointerValue) {
  const klass = g.type.class_ref(Reflect.getOwnMetadata("gi:gtype", target));

  const nProps = g.object_info.get_n_properties(info);

  for (let i = 0; i < nProps; i++) {
    const propInfo = g.object_info.get_property(info, i);
    const cName = g.base_info.get_name(propInfo);
    const paramSpecPointer = g.object_class.find_property(klass, cName);
    handleProp(target, propInfo, paramSpecPointer!);
    g.base_info.unref(propInfo);
  }
}

type Callback = (...args: unknown[]) => unknown;

export function createObject(info: Deno.PointerValue, gType: bigint) {
  const ObjectClass = class {
    constructor(props = {}) {
      Reflect.defineMetadata("gi:ref", g.object.new(gType, null), this);
      Object.entries(props).forEach(([key, value]) => {
        // TODO: set the properties directly in the gobject_new function
        /// @ts-expect-error we are setting all the properties at once
        this[key] = value;
      });
    }

    connect(action: string, callback: Callback) {
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

    on(action: string, callback: Callback) {
      return this.connect(action, callback);
    }

    once(action: string, callback: Callback) {
      const handler = this.connect(action, (...args) => {
        callback(...args);
        this.off(handler);
      });

      return handler;
    }

    off(handler: bigint | number) {
      g.signal.handler_disconnect(
        Reflect.getOwnMetadata("gi:ref", this),
        handler,
      );
    }

    emit(action: string) {
      g.signal.emit_by_name(
        Reflect.getOwnMetadata("gi:ref", this),
        action,
      );
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

  return ObjectClass;
}
