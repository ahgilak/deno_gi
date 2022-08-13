import GIRepository from "./bindings/gobject-introspection/symbols.ts";
import { GIInfoType } from "./bindings/gobject-introspection/enums.ts";

import { createFunction } from "./types/callable.js";
import { createConstant } from "./types/constant.js";
import { createEnum } from "./types/enum.js";
import { createObject } from "./types/object.js";
import { createStruct } from "./types/struct.js";
import { createInterface } from "./types/interface.js";

function handleInfo(info) {
  const type = GIRepository.g_base_info_get_type(info);

  switch (type) {
    case GIInfoType.GI_INFO_TYPE_FUNCTION:
      return createFunction(info);

    case GIInfoType.GI_INFO_TYPE_CONSTANT:
      return createConstant(info);

    case GIInfoType.GI_INFO_TYPE_ENUM:
    case GIInfoType.GI_INFO_TYPE_FLAGS:
      return createEnum(info);

    case GIInfoType.GI_INFO_TYPE_OBJECT:
      return createObject(info);

    case GIInfoType.GI_INFO_TYPE_STRUCT:
      return createStruct(info);

    case GIInfoType.GI_INFO_TYPE_INTERFACE:
      return createInterface(info);

    case GIInfoType.GI_INFO_TYPE_ARG:
      return "Unhandled Type: Arg";
    case GIInfoType.GI_INFO_TYPE_BOXED:
      return "Unhandled Type: Boxed";
    case GIInfoType.GI_INFO_TYPE_CALLBACK:
      return "Unhandled Type: Callback";
    case GIInfoType.GI_INFO_TYPE_FIELD:
      return "Unhandled Type: Field";
    case GIInfoType.GI_INFO_TYPE_PROPERTY:
      return "Unhandled Type: Property";
    case GIInfoType.GI_INFO_TYPE_SIGNAL:
      return "Unhandled Type: Signal";
    case GIInfoType.GI_INFO_TYPE_TYPE:
      return "Unhandled Type: Type";
    case GIInfoType.GI_INFO_TYPE_UNION:
      return "Unhandled Type: Union";
    case GIInfoType.GI_INFO_TYPE_UNRESOLVED:
      return "Unhandled Type: Unresolved";
    case GIInfoType.GI_INFO_TYPE_VALUE:
      return "Unhandled Type: Value";
    case GIInfoType.GI_INFO_TYPE_VFUNC:
      return "Unhandled type: VFunc";

    default:
      throw new Error("Invalid Type");
  }
}

export default handleInfo;
