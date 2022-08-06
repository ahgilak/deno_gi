import GIRepository from "../bindings/gobject-introspection/girepository.js";
import { prepareParam } from "../prepare.js";

const nativeTypes = {
  [GIRepository.GITypeTag.GI_TYPE_TAG_BOOLEAN]: "i32",
  [GIRepository.GITypeTag.GI_TYPE_TAG_UINT8]: "u8",
  [GIRepository.GITypeTag.GI_TYPE_TAG_INT8]: "i8",
  [GIRepository.GITypeTag.GI_TYPE_TAG_UINT16]: "u16",
  [GIRepository.GITypeTag.GI_TYPE_TAG_INT16]: "i16",
  [GIRepository.GITypeTag.GI_TYPE_TAG_UINT32]: "u32",
  [GIRepository.GITypeTag.GI_TYPE_TAG_INT32]: "i32",
  [GIRepository.GITypeTag.GI_TYPE_TAG_UINT64]: "u64",
  [GIRepository.GITypeTag.GI_TYPE_TAG_INT64]: "i64",
  [GIRepository.GITypeTag.GI_TYPE_TAG_FLOAT]: "f32",
  [GIRepository.GITypeTag.GI_TYPE_TAG_DOUBLE]: "f64",
  [GIRepository.GITypeTag.GI_TYPE_TAG_VOID]: "void",
};

function ffiType(tag) {
  return nativeTypes[tag] || "pointer";
}

function parseArgs(val, i) {
  const argInfo = GIRepository.g_callable_info_get_arg(info, i);
  const argType = GIRepository.g_arg_info_get_type(argInfo);
  const result = prepareParam(argType, val);
  GIRepository.g_base_info_unref(argInfo);
  GIRepository.g_base_info_unref(argType);
  return result;
}

export function createCallback(info, callback, target) {
  const nArgs = GIRepository.g_callable_info_get_n_args(info);
  const parameters = [];
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

  if (target) {
    return new Deno.UnsafeCallback({
      parameters: ["pointer", ...parameters],
      result,
    }, (_, ...args) => {
      return callback.bind(target)(...args.map(parseArgs));
    });
  }

  return new Deno.UnsafeCallback(
    { parameters, result },
    (...args) => callback(...args.map(parseArgs)),
  );
}
