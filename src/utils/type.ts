import GIRepository from "../bindings/gobject-introspection/symbols.ts";
import { GITypeTag } from "../bindings/gobject-introspection/enums.ts";

export function getTypeSize(typeTag: number) {
  switch (typeTag) {
    case GITypeTag.GI_TYPE_TAG_BOOLEAN:
      return 1 << 2;

    case GITypeTag.GI_TYPE_TAG_UINT8:
    case GITypeTag.GI_TYPE_TAG_INT8:
      return 1;

    case GITypeTag.GI_TYPE_TAG_UINT16:
    case GITypeTag.GI_TYPE_TAG_INT16:
      return 1 << 1;

    case GITypeTag.GI_TYPE_TAG_UINT32:
    case GITypeTag.GI_TYPE_TAG_INT32:
      return 1 << 2;

    case GITypeTag.GI_TYPE_TAG_UINT64:
    case GITypeTag.GI_TYPE_TAG_INT64:
      return 1 << 3;

    case GITypeTag.GI_TYPE_TAG_FLOAT:
      return 1 << 2;

    case GITypeTag.GI_TYPE_TAG_DOUBLE:
      return 1 << 3;

    default:
      return 1 << 3;
  }
}

export function getGType(info: Deno.PointerValue) {
  return GIRepository.g_registered_type_info_get_g_type(info).valueOf();
}
