import { GIInfoType } from "../bindings/enums.js";
import g from "../bindings/mod.js";
import { createEnum } from "../types/enum.js";
import { createInterface } from "../types/interface.js";
import { createObject } from "../types/object.js";
import { createStruct } from "../types/struct.js";

export const cache = new Map();

export function objectByGType(gType) {
  if (cache.has(gType)) {
    return cache.get(gType);
  }

  const info = g.irepository.find_by_gtype(null, gType);
  const result = createGObject(info, gType);
  Object.freeze(result);
  cache.set(gType, result);
  g.base_info.unref(info);
  return result;
}

export function objectByInfo(info) {
  const gType = g.registered_type_info.get_g_type(info);

  // TODO: 4n is actually G_TYPE_VOID
  if (gType !== 4n && cache.has(gType)) {
    return cache.get(gType);
  }

  const result = createGObject(info, gType);
  Object.freeze(result);
  cache.set(gType, result);
  return result;
}

function createGObject(info, gType) {
  const type = g.base_info.get_type(info);

  switch (type) {
    case GIInfoType.ENUM:
    case GIInfoType.FLAGS:
      return createEnum(info);

    case GIInfoType.OBJECT:
      return createObject(info, gType);

    case GIInfoType.INTERFACE:
      return createInterface(info, gType);

    case GIInfoType.STRUCT:
      return createStruct(info, gType);
  }
}
