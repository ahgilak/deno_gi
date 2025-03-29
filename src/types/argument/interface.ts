import {cast_ptr_u64, cast_u64_ptr, deref_buf, deref_ptr, peek_ptr} from "../../base_utils/convert.ts";
import {GIInfoType, GType} from "../../bindings/enums.ts";
import g from "../../bindings/mod.ts";
import {ExtendedDataView} from "../../utils/dataview.js";
import {objectByGType} from "../../utils/gobject.js";
import {createCallback} from "../callback.ts";
import {CbHandler} from "../../overrides/GObject.ts";

export function boxInterface(info: Deno.PointerValue, value: object) {
  const type = g.base_info.get_type(info);
  console.log("value", value);
  switch (type) {
    case GIInfoType.OBJECT:
    case GIInfoType.INTERFACE:
    case GIInfoType.STRUCT:
      return value ? cast_ptr_u64(Reflect.getOwnMetadata("gi:ref", value)) : 0n;
    case GIInfoType.ENUM:
    case GIInfoType.FLAGS:
      return value;
    case GIInfoType.CALLBACK: {
      // @todo typecheck value as CbHandler
      const cb = createCallback(info, value as CbHandler);
      return cast_ptr_u64(cb.pointer);
    }
    default:
      return value;
  }
}

export function unboxInterface(info: unknown, buffer: ArrayBufferLike) {
  const pointer = deref_ptr(buffer);
  if (!pointer) return null;

  const argValue = deref_buf(pointer, 8);
  const dataView = new ExtendedDataView(argValue);
  let gType = g.registered_type_info.get_g_type(info);

  if (g.type.is_a(gType, GType.OBJECT)) {
    const pointer = cast_u64_ptr(dataView.getBigUint64());

    if (pointer === null) throw new TypeError("pointer is null");

    const typeInstance = peek_ptr(pointer);

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

export function getInterfaceSize(info: Deno.PointerObject): number | null {
  const type = g.base_info.get_type(info);

  switch (type) {
    case GIInfoType.STRUCT:
      return g.struct_info.get_size(info);
    case GIInfoType.INTERFACE:
    case GIInfoType.OBJECT: {
      const query = g.type.query(g.registered_type_info.get_g_type(type));
      const view = new ExtendedDataView(deref_buf(query, 24));
      // the offset of the instance_size
      return view.getUint8(20);
    }
    // @todo validate below
    case GIInfoType.ENUM:
    case GIInfoType.FLAGS:
    default:
      return null;
  }
}
