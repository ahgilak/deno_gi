import { cast_ptr_u64, cast_u64_ptr } from "../../base_utils/convert.ts";
import { GIInfoType, GType } from "../../bindings/enums.js";
import g from "../../bindings/mod.js";
import { ExtendedDataView } from "../../utils/dataview.js";
import { objectByGType, objectByInfo } from "../../utils/gobject.js";
import { createCallback } from "../callback.js";

export function boxInterface(info, value) {
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
  info,
  argValue,
) {
  const dataView = new ExtendedDataView(argValue);
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
      // This is needed otherwise we assign to a read-only property
      let leaf_gType = gType;

      // get the descendant gType for GObject.Object
      if (g.type.is_a(gType, GType.OBJECT)) {
        // TODO: find a way to get the gtype from the object
        // TYPE_FROM_INSTANCE seems to be a macro, so we can't call it
        const type_name = g.type.name_from_instance(cast_u64_ptr(pointer));
        const descendant_gType = type_name ? g.type.from_name(type_name) : null;

        if (descendant_gType) {
          leaf_gType = descendant_gType;
        }
      }

      // only use gType if the object is a descendant of GObject.Object
      const object = (leaf_gType === gType || leaf_gType === GType.NONE)
        ? objectByInfo(info)
        : objectByGType(leaf_gType);

      const result = Object.create(object.prototype);

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
