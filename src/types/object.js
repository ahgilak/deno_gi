import GIRepository from "../bindings/gobject-introspection/symbols.ts";
import { GIFunctionInfoFlags } from "../bindings/gobject-introspection/enums.ts";
import GObject from "../bindings/gobject/symbols.ts";
import { GParamFlags } from "../bindings/gobject/enums.ts";
import { createConstructor, createFunction, createMethod } from "./callable.js";
import { getName, toCamelCase, toCString, toKebabCase } from "../utils.ts";
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
      const isConstructor = GIFunctionInfoFlags.GI_FUNCTION_IS_CONSTRUCTOR &
        flags;

      const value = isConstructor
        ? createConstructor(methodInfo, target)
        : createFunction(methodInfo);

      Object.defineProperty(target, name, { value });
    }
  }
}

function defineProperties(target, info) {
  const nProps = GIRepository.g_object_info_get_n_properties(info);

  for (let i = 0; i < nProps; i++) {
    const propInfo = GIRepository.g_object_info_get_property(info, i);
    const name = toCamelCase(getName(propInfo));
    if (Object.hasOwn(target.prototype, name)) {
      continue;
    }

    const flags = GIRepository.g_property_info_get_flags(propInfo);

    Object.defineProperty(target.prototype, name, {
      get() {
        if (!(flags & GParamFlags.READABLE)) {
          throw new Error(`Property ${name} is not readable`);
        }

        const getter = GIRepository.g_property_info_get_getter(propInfo);
        const result = createMethod(getter, this.__ref__)();
        GIRepository.g_base_info_unref(getter);
        return result;
      },

      set(v) {
        if (!(flags & GParamFlags.WRITABLE)) {
          throw new Error(`Property ${name} is not writable`);
        }

        const setter = GIRepository.g_property_info_get_setter(propInfo);
        const result = createMethod(setter, this.__ref__)(v);
        GIRepository.g_base_info_unref(setter);
        return result;
      },
    });
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
        const name = toCString(toKebabCase(key));
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
  defineProperties(obj, info);

  const parent = GIRepository.g_object_info_get_parent(info);
  if (parent) {
    const Parent = createObject(parent);
    Object.setPrototypeOf(obj.prototype, Parent.prototype);
    Object.assign(obj.__signals__, Parent.__signals__);
    GIRepository.g_base_info_unref(parent);
  }
}
