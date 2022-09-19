// deno-lint-ignore-file no-explicit-any

import GIRepository from "../bindings/gobject-introspection/symbols.ts";
import { GITypeTag } from "../bindings/gobject-introspection/enums.ts";
import { GIArgumentToJS } from "./argument.ts";

const nativeTypes: Record<number, Deno.NativeResultType> = {
  [GITypeTag.GI_TYPE_TAG_BOOLEAN]: "i32",
  [GITypeTag.GI_TYPE_TAG_UINT8]: "u8",
  [GITypeTag.GI_TYPE_TAG_INT8]: "i8",
  [GITypeTag.GI_TYPE_TAG_UINT16]: "u16",
  [GITypeTag.GI_TYPE_TAG_INT16]: "i16",
  [GITypeTag.GI_TYPE_TAG_UINT32]: "u32",
  [GITypeTag.GI_TYPE_TAG_INT32]: "i32",
  [GITypeTag.GI_TYPE_TAG_UINT64]: "u64",
  [GITypeTag.GI_TYPE_TAG_INT64]: "i64",
  [GITypeTag.GI_TYPE_TAG_FLOAT]: "f32",
  [GITypeTag.GI_TYPE_TAG_DOUBLE]: "f64",
  [GITypeTag.GI_TYPE_TAG_VOID]: "void",
};

function ffiType(tag: number): Deno.NativeResultType {
  return nativeTypes[tag] || "pointer";
}

function parseArgs(
  info: Deno.PointerValue,
  args: (number | Deno.PointerValue)[],
) {
  return args.map((value, i) => {
    const argInfo = GIRepository.g_callable_info_get_arg(info, i);
    const argType = GIRepository.g_arg_info_get_type(argInfo);
    const tag = GIRepository.g_type_info_get_tag(argType);
    const result = nativeTypes[tag]
      ? value
      : GIArgumentToJS(argType, new BigUint64Array([BigInt(value)]).buffer);

    GIRepository.g_base_info_unref(argInfo);
    GIRepository.g_base_info_unref(argType);
    return result;
  });
}

export function createCallback(
  info: Deno.PointerValue,
  callback: (...args: any[]) => any,
  caller?: any,
) {
  const nArgs = GIRepository.g_callable_info_get_n_args(info);
  const parameters = caller ? ["pointer"] : caller;
  const returnType = GIRepository.g_callable_info_get_return_type(info);
  const returnTypeTag = GIRepository.g_type_info_get_tag(returnType);
  const result = ffiType(returnTypeTag);
  GIRepository.g_base_info_unref(returnType);

  for (let i = 0; i < nArgs; i++) {
    const argInfo = GIRepository.g_callable_info_get_arg(info, i);
    const argType = GIRepository.g_arg_info_get_type(argInfo);
    const argTypeTag = GIRepository.g_type_info_get_tag(argType);
    parameters.push(ffiType(argTypeTag));
    GIRepository.g_base_info_unref(argType);
    GIRepository.g_base_info_unref(argInfo);
  }

  return new Deno.UnsafeCallback(
    { parameters, result },
    caller
      ? (_, ...args) => callback(caller, ...parseArgs(info, args))
      : (...args: any[]) => callback(...parseArgs(info, args)),
  );
}
