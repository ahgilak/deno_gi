import { GIInfoType } from "../bindings/enums.ts";
import g from "../bindings/mod.ts";
import { createEnum } from "../types/enum.ts";
import { createInterface } from "../types/interface.ts";
import { createObject } from "../types/object.ts";
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
