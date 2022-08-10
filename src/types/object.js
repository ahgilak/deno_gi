import GIRepository from "../bindings/gobject-introspection/girepository.js";
import GObject from "../bindings/gobject/gobject.js";
import { createConstructor, createFunction, createMethod } from "./callable.js";
import { getName, toCString, toSnakeCase } from "../utils.js";
import { setGValue } from "../gvalue.js";
import { createCallback } from "./callback.js";

function defineMethods(target, info) {
  const nMethods = GIRepository.g_object_info_get_n_methods(info);

  for (let i = 0; i < nMethods; i++) {
    const methodInfo = GIRepository.g_object_info_get_method(info, i);
    const isMethod = GIRepository.g_callable_info_is_method(methodInfo);
    const name = getName(methodInfo);

    if (isMethod) {
      Object.defineProperty(target.prototype, name, {
        value(...args) {
          return createMethod(methodInfo, this.__ref__)(...args);
        },
      });
    } else {
      const flags = GIRepository.g_function_info_get_flags(methodInfo);
      const isConstructor =
        GIRepository.GIFunctionInfoFlags.GI_FUNCTION_IS_CONSTRUCTOR & flags;

      const value = isConstructor
        ? createConstructor(methodInfo, target)
        : createFunction(methodInfo);

      Object.defineProperty(target, name, { value });
    }
  }
}

function getSignals(info) {
  const nSignals = GIRepository.g_object_info_get_n_signals(info);
  const result = {};

  for (let i = 0; i < nSignals; i++) {
    const singalInfo = GIRepository.g_object_info_get_signal(info, i);
    const name = getName(singalInfo);

    result[name] = singalInfo;
  }

  return result;
}

const cache = {};

export function createObject(info) {
  const gtype = GIRepository.g_registered_type_info_get_g_type(info);

  if (cache[gtype]) {
    return cache[gtype];
  }

  const ResultClass = class {
    static name = getName(info);
    static __signals__ = getSignals(info);

    constructor(props = {}) {
      const klass = GObject.g_type_class_ref(gtype);

      const length = Object.keys(props).length;
      const names = new BigUint64Array(length);
      const values = new BigUint64Array(length * 3);

      Object.entries(props).forEach(([key, value], i) => {
        const name = toCString(toSnakeCase(key));
        const param = GObject.g_object_class_find_property(klass, name);
        const gvalue = new BigUint64Array(3); // GValue is 24 byte
        const gtype = new Deno.UnsafePointerView(param).getBigUint64(24); // param->value_type

        setGValue(gvalue, gtype, value, true);
        names[i] = BigInt(Deno.UnsafePointer.of(name));
        values.set(gvalue, i * 3);
      });

      Object.defineProperty(this, "__ref__", {
        value: BigInt(GObject.g_object_new_with_properties(
          gtype,
          length,
          names,
          values,
        )),
      });
    }

    on(action, callback) {
      const signalInfo = this.constructor.__signals__[action];
      const cb = createCallback(signalInfo, callback, this);

      const handlerId = GObject.g_signal_connect_data(
        this.__ref__,
        toCString(action),
        cb.pointer,
        null,
        null,
        0,
      );

      return handlerId;
    }

    once(action, callback) {
      const handlerId = this.on(action, (...args) => {
        callback(...args);
        this.off(handlerId);
      });

      return handlerId;
    }

    off(handlerId) {
      GObject.g_signal_handler_disconnect(
        this.__ref__,
        handlerId,
      );
    }

    emit(action) {
      GObject.g_signal_emit_by_name(this.__ref__, toCString(action));
    }
  };

  extendObject(ResultClass, info);

  return cache[gtype] = ResultClass;
}

function extendObject(obj, info) {
  defineMethods(obj, info);

  const parent = GIRepository.g_object_info_get_parent(info);
  if (parent) {
    const Parent = createObject(parent);
    Object.setPrototypeOf(obj.prototype, Parent.prototype);
    Object.assign(obj.__signals__, Parent.__signals__);
    GIRepository.g_base_info_unref(parent);
  }
}
