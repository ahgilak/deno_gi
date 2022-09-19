// deno-lint-ignore-file no-explicit-any
import GIRepository from "../bindings/gobject-introspection/symbols.ts";
import GObject from "../bindings/gobject/symbols.ts";
import { createCallback } from "./callback.ts";
import { getName, toCString } from "../utils/string.ts";
import { getGType } from "../utils/type.ts";
import {
  defineMethod,
  defineProp,
  defineSignal,
  defineVFunc,
  ObjectByGType,
} from "../utils/object.ts";
import { GConnectFlags } from "../bindings/gobject/enums.ts";

function defineMethods(target: any, info: Deno.PointerValue) {
  const nMethods = GIRepository.g_object_info_get_n_methods(info);

  for (let i = 0; i < nMethods; i++) {
    const methodInfo = GIRepository.g_object_info_get_method(info, i);
    defineMethod(target, methodInfo);
  }
}

function defineVFuncs(target: any, info: Deno.PointerValue) {
  const nMethods = GIRepository.g_object_info_get_n_vfuncs(info);

  for (let i = 0; i < nMethods; i++) {
    const vFuncInfo = GIRepository.g_object_info_get_vfunc(info, i);
    defineVFunc(target, vFuncInfo);
  }
}

function defineProperties(target: any, info: Deno.PointerValue) {
  const nProps = GIRepository.g_object_info_get_n_properties(info);

  for (let i = 0; i < nProps; i++) {
    const propInfo = GIRepository.g_object_info_get_property(info, i);
    const cName = GIRepository.g_base_info_get_name(propInfo);
    const paramSpecPointer = GObject.g_object_class_find_property(
      target.__object__,
      cName,
    );

    defineProp(target, propInfo, paramSpecPointer);
    GIRepository.g_base_info_unref(propInfo);
  }
}

function defineSignals(target: any, info: Deno.PointerValue) {
  const nSignals = GIRepository.g_object_info_get_n_signals(info);

  for (let i = 0; i < nSignals; i++) {
    const signalInfo = GIRepository.g_object_info_get_signal(info, i);
    defineSignal(target, BigInt(signalInfo));
  }
}

function extendObject(target: any, info: Deno.PointerValue) {
  const parent = GIRepository.g_object_info_get_parent(info);
  if (parent) {
    const gType = getGType(parent);
    const ParentClass = ObjectByGType(gType);
    Object.setPrototypeOf(target.prototype, ParentClass.prototype);
    Object.assign(target.__signals__, ParentClass.__signals__);
    GIRepository.g_base_info_unref(parent);
  }
}

function inheritInterfaces(target: any, info: Deno.PointerValue) {
  const nInterfaces = GIRepository.g_object_info_get_n_interfaces(info);

  for (let i = 0; i < nInterfaces; i++) {
    const interfaceInfo = GIRepository.g_object_info_get_interface(info, i);
    const interfaceGType = getGType(interfaceInfo);
    const interface_ = ObjectByGType(interfaceGType);

    for (const key of Object.keys(interface_.prototype)) {
      if (Object.hasOwn(target.prototype, key)) {
        continue;
      }

      Object.defineProperty(
        target.prototype,
        key,
        Object.getOwnPropertyDescriptor(interface_.prototype, key)!,
      );
    }

    Object.assign(target.__signals__, interface_.__signals__);
    GIRepository.g_base_info_unref(interfaceInfo);
  }
}

export function createObject(info: Deno.PointerValue) {
  const gType = getGType(info);

  const ObjectClass = class {
    __ref__!: bigint;
    static __signals__: Record<string, Deno.PointerValue>;
    static __object__: Deno.PointerValue;

    constructor(props = {}) {
      Object.defineProperty(this, "__ref__", {
        value: BigInt(GObject.g_object_new(gType, null)),
      });

      Object.entries(props).forEach(([key, value]) => {
        // @ts-ignore FIXME:
        this[key] = value;
      });
    }

    connect(action: string, callback: (...args: any[]) => any) {
      const signalInfo = ObjectClass.__signals__[action.split("::")[0]];
      const cb = createCallback(signalInfo, callback, this);

      const handler = GObject.g_signal_connect_data(
        this.__ref__,
        toCString(action),
        cb.pointer,
        null,
        null,
        GConnectFlags.G_CONNECT_SWAPPED,
      );

      return handler;
    }

    on(action: string, callback: (...args: any[]) => any) {
      return this.connect(action, callback);
    }

    once(action: string, callback: (...args: any[]) => any) {
      const handler = this.connect(action, (...args) => {
        callback(...args);
        this.off(handler);
      });

      return handler;
    }

    off(handler: Deno.PointerValue) {
      GObject.g_signal_handler_disconnect(
        this.__ref__,
        handler,
      );
    }

    emit(action: string) {
      GObject.g_signal_emit_by_name(this.__ref__, toCString(action));
    }
  };

  Object.defineProperties(ObjectClass, {
    name: { value: getName(info) },
    __gtype__: { value: gType },
    __object__: { value: GObject.g_type_class_ref(gType) },
    __signals__: { value: {} },
  });

  defineMethods(ObjectClass, info);
  defineVFuncs(ObjectClass, info);
  defineProperties(ObjectClass, info);
  defineSignals(ObjectClass, info);
  inheritInterfaces(ObjectClass, info);
  extendObject(ObjectClass, info);

  return ObjectClass;
}
