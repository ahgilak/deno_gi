import GIRepository from "./bindings/gobject-introspection/girepository.js";
import { createObjectInstance } from "./types/object.js";
import { createStructInstance } from "./types/struct.js";
import { createCallback } from "./types/callback.js";

export function valueFromInter(info, ref) {
  const type = GIRepository.g_base_info_get_type(info);

  switch (type) {
    case GIRepository.GIInfoType.GI_INFO_TYPE_OBJECT:
      return createObjectInstance(info, ref);
    case GIRepository.GIInfoType.GI_INFO_TYPE_STRUCT:
      return createStructInstance(info, ref);
  }
}

export function interFromValue(info, value) {
  const type = GIRepository.g_base_info_get_type(info);

  if (!value) {
    return 0n;
  }

  switch (type) {
    case GIRepository.GIInfoType.GI_INFO_TYPE_OBJECT:
    case GIRepository.GIInfoType.GI_INFO_TYPE_STRUCT:
      return value.__ref;
    case GIRepository.GIInfoType.GI_INFO_TYPE_ENUM:
    case GIRepository.GIInfoType.GI_INFO_TYPE_FLAGS:
      return BigInt(value);
    case GIRepository.GIInfoType.GI_INFO_TYPE_CALLBACK:
      return createCallback(info, value).pointer;
    default:
      return BigInt(value);
  }
}
