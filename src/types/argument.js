import g from "../bindings/mod.js";
import { GITypeTag } from "../bindings/enums.js";
import {
  cast_buf_ptr,
  cast_ptr_u64,
  cast_str_buf,
  cast_u64_ptr,
  deref_str,
} from "../base_utils/convert.ts";
import { ExtendedDataView } from "../utils/dataview.js";
import { objectByInfo } from "../utils/gobject.js";
import { boxArray, unboxArray } from "./argument/array.js";
import { boxInterface, unboxInterface } from "./argument/interface.js";

export function initArgument(type) {
  const tag = g.type_info.get_tag(type);

  switch (tag) {
    case GITypeTag.INTERFACE: {
      const info = g.type_info.get_interface(type);
      const o = objectByInfo(info);
      const v = new o();
      const result = cast_ptr_u64(Reflect.getOwnMetadata("gi:ref", v));
      g.base_info.unref(info);
      return result;
    }
    default: {
      return cast_ptr_u64(cast_buf_ptr(new Uint8Array(1)));
    }
  }
}

/** This function is given a pointer OR a value, and must hence extract it
 * @param {Deno.PointerObject} type
 * @param {ArrayBufferLike} value
 * @param {number?} length
 * @returns
 */
export function unboxArgument(type, value, length) {
  const dataView = new ExtendedDataView(value);
  const tag = g.type_info.get_tag(type);

  switch (tag) {
    case GITypeTag.VOID:
      return;

    case GITypeTag.UNICHAR:
      // TODO: this code is very verbose, and might be uneeded
      return String.fromCharCode(Number(BigInt.asIntN(8, BigInt(pointer))));

    case GITypeTag.BOOLEAN:
      return Boolean(pointer);

    case GITypeTag.UINT8:
    case GITypeTag.INT8:
    case GITypeTag.UINT16:
    case GITypeTag.INT16:
    case GITypeTag.UINT32:
    case GITypeTag.INT32:
    case GITypeTag.FLOAT:
      return Number(pointer);
    
    case GITypeTag.UINT64:
    case GITypeTag.INT64:
    case GITypeTag.DOUBLE:
      return BigInt(pointer);
    
    case GITypeTag.UTF8:
    case GITypeTag.FILENAME: {
      if (!pointer) {
        return null;
      }

      return deref_str(cast_u64_ptr(pointer));
    }

    /* non-basic types */

    case GITypeTag.ARRAY: {
      return unboxArray(type, value, length);
    }

    case GITypeTag.GLIST:
    case GITypeTag.GSLIST: {
      return unboxList(type, pointer);
    }

    case GITypeTag.INTERFACE: {
      if (!pointer) {
        return null;
      }

      const info = g.type_info.get_interface(type);
      const result = unboxInterface(info, pointer);
      g.base_info.unref(info);
      return result;
    }

    default:
      return pointer;
  }
}

export function boxArgument(type, value) {
  const buffer = new ArrayBuffer(8);
  if (!value) return buffer;
  const dataView = new ExtendedDataView(buffer);
  const tag = g.type_info.get_tag(type);

  switch (tag) {
    case GITypeTag.BOOLEAN:
      dataView.setInt32(value);
      break;

    case GITypeTag.UINT8:
      dataView.setUint8(value);
      break;

    case GITypeTag.INT8:
      dataView.setInt8(value);
      break;

    case GITypeTag.UINT16:
      dataView.setUint16(value);
      break;

    case GITypeTag.INT16:
      dataView.setInt16(value);
      break;

    case GITypeTag.UINT32:
      dataView.setUint32(value);
      break;

    case GITypeTag.INT32:
      dataView.setInt32(value);
      break;

    case GITypeTag.UINT64:
      dataView.setBigUint64(value);
      break;

    case GITypeTag.INT64:
      dataView.setBigInt64(value);
      break;

    case GITypeTag.FLOAT:
      dataView.setFloat32(0, value);
      break;

    case GITypeTag.DOUBLE:
      dataView.setFloat64(0, value);
      break;

    case GITypeTag.UTF8:
    case GITypeTag.FILENAME:
      dataView.setBigUint64(
        cast_ptr_u64(cast_buf_ptr(cast_str_buf(value))),
      );
      break;

    case GITypeTag.GTYPE:
      dataView.setBigUint64(value);
      break;

    /* non-basic types */

    case GITypeTag.ARRAY: {
      if (Array.isArray(value)) {
        value = boxArray(type, value);
      }

      dataView.setBigUint64(
        cast_ptr_u64(cast_buf_ptr(value)),
      );
      break;
    }

    case GITypeTag.INTERFACE: {
      const info = g.type_info.get_interface(type);
      dataView.setBigUint64(
        BigInt(boxInterface(info, value)),
      );
      g.base_info.unref(info);
      break;
    }
  }

  return buffer;
}
