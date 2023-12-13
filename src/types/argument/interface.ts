import { cast_ptr_u64, cast_u64_ptr } from "../../base_utils/convert.ts";
import { GIInfoType } from "../../bindings/enums.ts";
import g from "../../bindings/mod.ts";
import { ExtendedDataView } from "../../utils/dataview.js";
import { objectByGType } from "../../utils/gobject.js";
import { createCallback } from "../callback.js";

export function boxInterface(info: Deno.PointerObject, value: object) {
  const type = g.base_info.get_type(info);

  switch (type) {
    case GIInfoType.OBJECT:
    case GIInfoType.INTERFACE:
    case GIInfoType.STRUCT:
      return cast_ptr_u64(Reflect.getOwnMetadata("gi:ref", value));
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
  info: Deno.PointerObject,
  buffer: ArrayBufferLike,
) {
  const dataView = new ExtendedDataView(buffer);
  const type = g.base_info.get_type(info);
  const gType = g.registered_type_info.get_g_type(info);
  /*
  let value = dataView.getBigUint64();

  if (gType == GObject.g_value_get_type()) {
    const buffer = new BigUint64Array(
      Deno.UnsafePointerView.getArrayBuffer(value, 24)
    );

    gType = buffer.at(0);
    value = BigInt(unboxGValue(buffer, gType));
    dataView.buffer = new BigUint64Array([value]).buffer;
  }
  */

  switch (type) {
    case GIInfoType.OBJECT:
    case GIInfoType.STRUCT:
    case GIInfoType.INTERFACE: {
      const result = Object.create(objectByGType(gType).prototype);
      Reflect.defineMetadata(
        "gi:ref",
        cast_u64_ptr(dataView.getBigUint64()),
        result,
      );
      return result;
    }

    case GIInfoType.ENUM:
    case GIInfoType.FLAGS:
      return dataView.getInt32();
  }
}
