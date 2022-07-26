import GIRepository from "./bindings/gobject-introspection/girepository.js";

import { createFunction } from "./types/callable.js";
import { createConstant } from "./types/constant.js";
import { createEnum } from "./types/enum.js";
import { createObject } from "./types/object.js";
import { createStruct } from "./types/struct.js";
import { createInterface } from "./types/interface.js";

function handleInfo(info) {
  const type = GIRepository.g_base_info_get_type(info);

  switch (type) {
    case GIRepository.GIInfoType.GI_INFO_TYPE_FUNCTION:
      return createFunction(info);

    case GIRepository.GIInfoType.GI_INFO_TYPE_CONSTANT:
      return createConstant(info);

    case GIRepository.GIInfoType.GI_INFO_TYPE_ENUM:
    case GIRepository.GIInfoType.GI_INFO_TYPE_FLAGS:
      return createEnum(info);

    case GIRepository.GIInfoType.GI_INFO_TYPE_OBJECT:
      return createObject(info);

    case GIRepository.GIInfoType.GI_INFO_TYPE_STRUCT:
      return createStruct(info);

    case GIRepository.GIInfoType.GI_INFO_TYPE_INTERFACE:
      return createInterface(info);

    case GIRepository.GIInfoType.GI_INFO_TYPE_ARG:
      return "Unhandled Type: Arg";
    case GIRepository.GIInfoType.GI_INFO_TYPE_BOXED:
      return "Unhandled Type: Boxed";
    case GIRepository.GIInfoType.GI_INFO_TYPE_CALLBACK:
      return "Unhandled Type: Callback";
    case GIRepository.GIInfoType.GI_INFO_TYPE_FIELD:
      return "Unhandled Type: Field";
    case GIRepository.GIInfoType.GI_INFO_TYPE_PROPERTY:
      return "Unhandled Type: Property";
    case GIRepository.GIInfoType.GI_INFO_TYPE_SIGNAL:
      return "Unhandled Type: Signal";
    case GIRepository.GIInfoType.GI_INFO_TYPE_TYPE:
      return "Unhandled Type: Type";
    case GIRepository.GIInfoType.GI_INFO_TYPE_UNION:
      return "Unhandled Type: Union";
    case GIRepository.GIInfoType.GI_INFO_TYPE_UNRESOLVED:
      return "Unhandled Type: Unresolved";
    case GIRepository.GIInfoType.GI_INFO_TYPE_VALUE:
      return "Unhandled Type: Value";
    case GIRepository.GIInfoType.GI_INFO_TYPE_VFUNC:
      return "Unhandled type: VFunc";

    default:
      throw new Error("Invalid Type");
  }
}

export default handleInfo;
