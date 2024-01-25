import { peek_ptr } from "../../base_utils/convert.ts";
import {
  cast_ptr_u64,
  cast_u64_ptr,
  deref_buf,
} from "../../base_utils/convert.ts";
import { GIInfoType, GType } from "../../bindings/enums.js";
import g from "../../bindings/mod.js";
import { ExtendedDataView } from "../../utils/dataview.js";
import { objectByGType } from "../../utils/gobject.js";
import { createCallback } from "../callback.js";

export function boxInterface(info, value) {
  const type = g.base_info.get_type(info);

  switch (type) {
    case GIInfoType.OBJECT:
    case GIInfoType.INTERFACE:
    case GIInfoType.STRUCT:
      return value
        ? cast_ptr_u64(Reflect.getOwnMetadata("gi:ref", value))
        : null;
    case GIInfoType.ENUM:
    case GIInfoType.FLAGS:
      return value;
    case GIInfoType.CALLBACK: {
      const cb = createCallback(info, value);
      const ptr = cast_ptr_u64(cb.pointer);
      return ptr;
    }
    default:
      return value;
  }
}

export function unboxInterface(
  info,
  pointer,
) {
  const argValue = deref_buf(cast_u64_ptr(pointer), 8);
  const dataView = new ExtendedDataView(argValue);
  const type = g.base_info.get_type(info);
  let gType = g.registered_type_info.get_g_type(info);

  if (g.type.is_a(gType, GType.OBJECT)) {
    const typeInstance = peek_ptr(cast_u64_ptr(dataView.getBigUint64()));

    gType = cast_ptr_u64(typeInstance);
  }

  switch (type) {
    case GIInfoType.OBJECT:
    case GIInfoType.STRUCT:
    case GIInfoType.INTERFACE: {
      const result = Object.create(objectByGType(gType).prototype);
      Reflect.defineMetadata(
        "gi:ref",
        cast_u64_ptr(pointer),
        result,
      );
      return result;
    }

    case GIInfoType.ENUM:
    case GIInfoType.FLAGS:
      return dataView.getInt32();
  }
}
