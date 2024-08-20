import {
  cast_ptr_u64,
  cast_u64_ptr,
  deref_buf,
  deref_ptr,
  peek_ptr,
} from "../../base_utils/convert.ts";
import { GIInfoType, GType } from "../../bindings/enums.js";
import g from "../../bindings/mod.js";
import { ExtendedDataView } from "../../utils/dataview.js";
import { objectByGType } from "../../utils/gobject.js";
import { createCallback } from "../callback.js";

export function boxInterface(info, value) {
  const type = g.base_info.get_type(info);
  console.log("value", value)
  switch (type) {
    case GIInfoType.OBJECT:
    case GIInfoType.INTERFACE:
    case GIInfoType.STRUCT:
      return value
        ? cast_ptr_u64(Reflect.getOwnMetadata("gi:ref", value))
        : 0n;
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

export function unboxInterface(info, buffer) {
  const pointer = deref_ptr(buffer);
  if (!pointer) return null;

  const argValue = deref_buf(pointer, 8);
  const dataView = new ExtendedDataView(argValue);
  let gType = g.registered_type_info.get_g_type(info);

  if (g.type.is_a(gType, GType.OBJECT)) {
    const typeInstance = peek_ptr(cast_u64_ptr(dataView.getBigUint64()));

    gType = cast_ptr_u64(typeInstance);
  }

  const result = Object.create(objectByGType(gType).prototype);
  Reflect.defineMetadata(
    "gi:ref",
    pointer,
    result,
  );
  return result;
}

/**
 * @param {Deno.PointerObject} info
 * @returns {number | null}
 */
export function getInterfaceSize(info) {
  const type = g.base_info.get_type(info);
  console;

  switch (type) {
    case GIInfoType.STRUCT:
      return g.struct_info.get_size(info);
      // I'm unsure
    case GIInfoType.ENUM:
    case GIInfoType.FLAGS:
      return null;
    case GIInfoType.INTERFACE:
    case GIInfoType.OBJECT: {
      const query = g.type.query(g.registered_type_info.get_g_type(type));
      const view = new ExtendedDataView(deref_buf(query, 24));
      // the offset of the instance_size
      return view.getUint8(20);
    }
  }
}
