// deno-lint-ignore-file no-explicit-any

import GIRepository from "../bindings/gobject-introspection/symbols.ts";
import GObject from "../bindings/gobject/symbols.ts";
import { getName } from "../utils/string.ts";
import { getGType } from "../utils/type.ts";
import {
  defineMethod,
  defineProp,
  defineSignal,
  defineVFunc,
} from "../utils/object.ts";

function defineMethods(target: any, info: Deno.PointerValue) {
  const nMethods = GIRepository.g_interface_info_get_n_methods(info);

  for (let i = 0; i < nMethods; i++) {
    const methodInfo = GIRepository.g_interface_info_get_method(info, i);
    defineMethod(target, methodInfo);
  }
}

function defineVFuncs(target: any, info: Deno.PointerValue) {
  const nMethods = GIRepository.g_interface_info_get_n_vfuncs(info);

  for (let i = 0; i < nMethods; i++) {
    const vFuncInfo = GIRepository.g_interface_info_get_vfunc(info, i);
    defineVFunc(target, vFuncInfo);
  }
}

function defineProperties(target: any, info: Deno.PointerValue) {
  const nProps = GIRepository.g_interface_info_get_n_properties(info);

  for (let i = 0; i < nProps; i++) {
    const propInfo = GIRepository.g_interface_info_get_property(info, i);
    const cName = GIRepository.g_base_info_get_name(propInfo);
    const paramSpecPointer = GObject.g_object_interface_find_property(
      target.__object__,
      cName,
    );

    defineProp(target, propInfo, paramSpecPointer);
    GIRepository.g_base_info_unref(propInfo);
  }
}

function defineSignals(target: any, info: Deno.PointerValue) {
  const nSignals = GIRepository.g_interface_info_get_n_signals(info);

  for (let i = 0; i < nSignals; i++) {
    defineSignal(target, info);
  }
}

export function createInterface(info: Deno.PointerValue) {
  const gType = getGType(info);

  const ObjectClass = class {};
  Object.defineProperties(ObjectClass, {
    name: { value: getName(info) },
    __gtype__: { value: gType },
    __object__: { value: BigInt(GObject.g_type_default_interface_ref(gType)) },
    __signals__: { value: {} },
  });

  defineMethods(ObjectClass, info);
  defineVFuncs(ObjectClass, info);
  defineProperties(ObjectClass, info);
  defineSignals(ObjectClass, info);

  return ObjectClass;
}
