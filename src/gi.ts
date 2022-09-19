// deno-lint-ignore-file no-explicit-any

import GIRepository from "./bindings/gobject-introspection/symbols.ts";
import { getName, toCString } from "./utils/string.ts";
import handleInfo from "./handleInfo.ts";
import { GIInfoType } from "./bindings/gobject-introspection/enums.ts";
import { ObjectByGType } from "./utils/object.ts";
import { getGType } from "./utils/type.ts";

function defineInfo(target: any, info: Deno.PointerValue) {
  const type = GIRepository.g_base_info_get_type(info);
  const name = getName(info);

  switch (type) {
    case GIInfoType.GI_INFO_TYPE_ENUM:
    case GIInfoType.GI_INFO_TYPE_FLAGS:
    case GIInfoType.GI_INFO_TYPE_OBJECT:
    case GIInfoType.GI_INFO_TYPE_STRUCT:
    case GIInfoType.GI_INFO_TYPE_INTERFACE: {
      const gType = getGType(info);
      Object.defineProperty(target, name, {
        get() {
          return ObjectByGType(gType);
        },
      });
      break;
    }

    default:
      Object.defineProperty(target, name, {
        value: handleInfo(info),
      });
      break;
  }
}

export function require(namespace: string, version?: string) {
  const result = new Object();

  const namespace_ = toCString(namespace);
  const version_ = version ? toCString(version) : null;

  GIRepository.g_irepository_require(
    null,
    namespace_,
    version_,
    0, // disable lazy load
    null,
  );

  const nInfos = GIRepository.g_irepository_get_n_infos(
    null,
    namespace_,
  );

  for (let i = 0; i < nInfos; i++) {
    const info = GIRepository.g_irepository_get_info(null, namespace_, i);

    defineInfo(result, info);

    GIRepository.g_base_info_unref(info);
  }

  return result;
}
