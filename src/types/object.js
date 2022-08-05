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
      if (!Object.hasOwn(target.prototype, name)) {
        Object.defineProperty(target.prototype, name, {
          value(...args) {
            return createMethod(methodInfo, this.__ref)(...args);
          },
        });
      }
    } else {
      const flags = GIRepository.g_function_info_get_flags(methodInfo);
      const isConstructor =
        GIRepository.GIFunctionInfoFlags.GI_FUNCTION_IS_CONSTRUCTOR & flags;

      const value = isConstructor
        ? createConstructor(methodInfo, target)
        : createFunction(methodInfo);

      if (!Object.hasOwn(target, name)) {
        Object.defineProperty(target, name, { value });
      }
    }
  }
}

function defineSignals(target, info) {
  const nSignals = GIRepository.g_object_info_get_n_signals(info);

  for (let i = 0; i < nSignals; i++) {
    const singalInfo = GIRepository.g_object_info_get_signal(info, i);
    const name = getName(singalInfo);

    target.__signals[name] = singalInfo;
  }
}

export function createObject(info) {
  const ResultClass = class {
    static name = getName(info);
    static __gtype = GIRepository.g_registered_type_info_get_g_type(info);
    static __klass = GObject.g_type_class_ref(this.__gtype);
    static __signals = [];

    constructor(props = {}) {
      const length = Object.keys(props).length;
      const names = new BigUint64Array(length);
      const values = new BigUint64Array(length * 3);

      Object.entries(props).forEach(([key, value], i) => {
        const name = Deno.UnsafePointer.of(toCString(toSnakeCase(key)));
        const param = GObject.g_object_class_find_property(
          this.constructor.__klass,
          name,
        );
        const gvalue = new BigUint64Array(3); // GValue is 24 byte
        const gtype = new Deno.UnsafePointerView(param).getBigUint64(24); // param->value_type

        setGValue(gvalue, gtype, value, true);
        names[i] = name;
        values.set(gvalue, i * 3);
      });

      Object.defineProperty(this, "__ref", {
        value: GObject.g_object_new_with_properties(
          this.constructor.__gtype,
          length,
          names,
          values,
        ),
      });
    }

    on(action, callback) {
      const signalInfo = this.constructor.__signals[action];
      const cb = createCallback(signalInfo, callback, this);

      const handlerId = GObject.g_signal_connect_data(
        this.__ref,
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
        this.__ref,
        handlerId,
      );
    }

    emit(action) {
      GObject.g_signal_emit_by_name(this.__ref, toCString(action));
    }
  };

  extendObject(ResultClass, info);
  GIRepository.g_base_info_unref(info);
  return ResultClass;
}

export function extendObject(self, info) {
  defineMethods(self, info);
  defineSignals(self, info);
  const parent = GIRepository.g_object_info_get_parent(info);
  if(parent){
    extendObject(self, parent);
    GIRepository.g_base_info_unref(parent);
  }
}
