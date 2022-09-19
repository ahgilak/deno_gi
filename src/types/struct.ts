// deno-lint-ignore-file no-explicit-any

import GIRepository from "../bindings/gobject-introspection/symbols.ts";
import { getName } from "../utils/string.ts";
import { defineMethod } from "../utils/object.ts";
import { getGType } from "../utils/type.ts";

function defineMethods(target: Record<string, any>, info: Deno.PointerValue) {
  const nMethods = GIRepository.g_struct_info_get_n_methods(info);

  for (let i = 0; i < nMethods; i++) {
    const methodInfo = GIRepository.g_struct_info_get_method(info, i);
    defineMethod(target, methodInfo);
  }
}

export function createStruct(info: Deno.PointerValue) {
  const gType = getGType(info);

  const ObjectClass = class {};

  Object.defineProperties(ObjectClass, {
    name: { value: getName(info) },
    __gtype__: { value: gType },
  });

  defineMethods(ObjectClass, info);

  return ObjectClass;
}
