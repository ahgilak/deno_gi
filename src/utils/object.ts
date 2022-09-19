// deno-lint-ignore-file no-explicit-any

import GIRepository from "../bindings/gobject-introspection/symbols.ts";
import GObject from "../bindings/gobject/symbols.ts";
import { GIFunctionInfoFlags } from "../bindings/gobject-introspection/enums.ts";
import { GParamFlags } from "../bindings/gobject/enums.ts";
import { GIArgumentToGValue, GValueToGIArgument } from "../types/value.ts";
import {
  createConstructor,
  createFunction,
  createMethod,
  createVFunc,
} from "../types/callable.ts";
import { getName } from "./string.ts";
import { GIArgumentToJS, JSToGIArgument } from "../types/argument.ts";
import handleInfo from "../handleInfo.ts";

export function defineMethod(target: any, methodInfo: Deno.PointerValue) {
  const flags = GIRepository.g_function_info_get_flags(methodInfo);
  const isMethod = GIFunctionInfoFlags.GI_FUNCTION_IS_METHOD & flags;
  const name = getName(methodInfo);

  if (isMethod) {
    Object.defineProperty(target.prototype, name, {
      enumerable: true,
      value(...args: any[]) {
        return createMethod(methodInfo, this.__ref__)(...args);
      },
    });
  } else {
    const isConstructor = GIFunctionInfoFlags.GI_FUNCTION_IS_CONSTRUCTOR &
      flags;

    const value = isConstructor
      ? createConstructor(methodInfo, target)
      : createFunction(methodInfo);

    Object.defineProperty(target, name, { value });
  }
}

export function defineVFunc(target: any, vFuncInfo: Deno.PointerValue) {
  const name = getName(vFuncInfo);

  if (Object.hasOwn(target.prototype, name)) {
    return;
  }

  Object.defineProperty(target.prototype, name, {
    enumerable: true,
    value(...args: any[]) {
      return createVFunc(vFuncInfo, this.__ref__, this.constructor.__gtype__)(
        ...args,
      );
    },
  });
}

export function defineProp(
  target: any,
  propInfo: Deno.PointerValue,
  paramSpecPointer: Deno.PointerValue,
) {
  const name = getName(propInfo);
  const paramSpecBuffer = Deno.UnsafePointerView.getArrayBuffer(
    paramSpecPointer,
    32, // paramSpec is 72 byte, but we only need 32 byte here.
  );

  if (Object.hasOwn(target.prototype, name)) {
    return;
  }

  const flags = GIRepository.g_property_info_get_flags(propInfo);
  const giType = GIRepository.g_property_info_get_type(propInfo);

  const paramSpecStruct = new BigUint64Array(paramSpecBuffer);
  const cName = paramSpecStruct.at(1)!;
  const gType = paramSpecStruct.at(3)!;
  const gValue = new BigUint64Array(3);
  GObject.g_value_init(gValue, gType);

  Object.defineProperty(target.prototype, name, {
    enumerable: true,
    get() {
      if (!(flags & GParamFlags.READABLE)) {
        throw new Error(`Property ${name} is not readable`);
      }

      GObject.g_object_get_property(this.__ref__, cName, gValue);
      const giValue = GValueToGIArgument(gValue, gType)!;
      return GIArgumentToJS(
        giType,
        new BigUint64Array([BigInt(giValue)]).buffer,
      );
    },

    set(value) {
      if (!(flags & GParamFlags.WRITABLE)) {
        throw new Error(`Property ${name} is not writable`);
      }

      const giValue = JSToGIArgument(giType, value);
      GIArgumentToGValue(gValue, gType, giValue);
      GObject.g_object_set_property(this.__ref__, cName, gValue);
    },
  });
}

export function defineSignal(target: any, signalInfo: Deno.PointerValue) {
  const name = getName(signalInfo);
  target.__signals__[name] = signalInfo;
}

export const cache = new Map<Deno.PointerValue, any>();

export function ObjectByGType(gType: Deno.PointerValue): any {
  if (cache.has(gType)) {
    return cache.get(gType);
  }

  const info = GIRepository.g_irepository_find_by_gtype(null, gType);
  const result = handleInfo(info);
  cache.set(gType, result);
  GIRepository.g_base_info_unref(info);
  return result;
}
