import GIRepository from "./bindings/gobject-introspection/girepository.js";
import { createObject } from "./types/object.js";
import { createStruct } from "./types/struct.js";
import { createCallback } from "./types/callback.js";

export function valueFromInter(info, ref) {
  const type = GIRepository.g_base_info_get_type(info);

  switch (type) {
    case GIRepository.GIInfoType.GI_INFO_TYPE_OBJECT:
      return Object.create(
        createObject(info).prototype,
        { __ref__: { value: ref } },
      );
    case GIRepository.GIInfoType.GI_INFO_TYPE_STRUCT:
      return Object.create(
        createStruct(info).prototype,
        { __ref__: { value: ref } },
      );
  }
}

export function interFromValue(info, value) {
  const type = GIRepository.g_base_info_get_type(info);

  switch (type) {
    case GIRepository.GIInfoType.GI_INFO_TYPE_OBJECT:
    case GIRepository.GIInfoType.GI_INFO_TYPE_STRUCT:
    case GIRepository.GIInfoType.GI_INFO_TYPE_INTERFACE:
      return value.__ref__;
    case GIRepository.GIInfoType.GI_INFO_TYPE_ENUM:
    case GIRepository.GIInfoType.GI_INFO_TYPE_FLAGS:
      return BigInt(value);
    case GIRepository.GIInfoType.GI_INFO_TYPE_CALLBACK:
      return createCallback(info, value).pointer;
    default:
      return BigInt(value);
  }
}