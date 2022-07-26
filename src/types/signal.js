import GIRepository from "../bindings/gobject-introspection/girepository.js";
import { prepareParam } from "../prepare.js";

function ffiType(tag) {
  switch (tag) {
    case GIRepository.GITypeTag.GI_TYPE_TAG_BOOLEAN:
      return "i32";

    case GIRepository.GITypeTag.GI_TYPE_TAG_UINT8:
      return "u8";

    case GIRepository.GITypeTag.GI_TYPE_TAG_INT8:
      return "i8";

    case GIRepository.GITypeTag.GI_TYPE_TAG_UINT16:
      return "u16";

    case GIRepository.GITypeTag.GI_TYPE_TAG_INT16:
      return "i16";

    case GIRepository.GITypeTag.GI_TYPE_TAG_UINT32:
      return "u32";

    case GIRepository.GITypeTag.GI_TYPE_TAG_INT32:
      return "i32";

    case GIRepository.GITypeTag.GI_TYPE_TAG_UINT64:
      return "u64";

    case GIRepository.GITypeTag.GI_TYPE_TAG_INT64:
      return "i64";

    case GIRepository.GITypeTag.GI_TYPE_TAG_FLOAT:
      return "f32";

    case GIRepository.GITypeTag.GI_TYPE_TAG_DOUBLE:
      return "f64";

    default:
      return "pointer";
  }
}

export function createSignalCallback(info, callback, target) {
  const nArgs = GIRepository.g_callable_info_get_n_args(info);
  const parameters = ["pointer"]; // first parameter is object itself
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

  return new Deno.UnsafeCallback({
    parameters,
    result,
  }, (_, ...args) => {
    const pArgs = args.map((val, i) => {
      const argInfo = GIRepository.g_callable_info_get_arg(info, i);
      const argType = GIRepository.g_arg_info_get_type(argInfo);
      const r = prepareParam(argType, val);
      GIRepository.g_base_info_unref(argInfo);
      return r;
    });
    return callback(target, ...pArgs);
  });
}

export function emitSignal() {
}
