import g from "../bindings/mod.js";
import { GITypeTag } from "../bindings/enums.js";
import {
  cast_buf_ptr,
  cast_ptr_u64,
  cast_str_buf,
  deref_ptr,
  deref_str,
} from "../base_utils/convert.ts";
import { ExtendedDataView } from "../utils/dataview.js";
import { objectByInfo } from "../utils/gobject.js";
import { boxArray, unboxArray } from "./argument/array.js";
import { boxInterface, unboxInterface } from "./argument/interface.js";
import { unboxList } from "./argument/list.js";
import { ensure_number_range } from "../bindings/ranges.ts";

export function initArgument(type) {
  const tag = g.type_info.get_tag(type);

  switch (tag) {
    case GITypeTag.INTERFACE: {
      // TODO: just generate a space large enough to hold the type
      const info = g.type_info.get_interface(type);
      const o = objectByInfo(info);
      const v = new o();
      const result = cast_ptr_u64(Reflect.getOwnMetadata("gi:ref", v));
      g.base_info.unref(info);
      return result;
    }
    default:
      // generate a new pointer
      return cast_ptr_u64(cast_buf_ptr(new ArrayBuffer(8)));
  }
}

/** This function is given a pointer OR a value, and must hence extract it
 * @param {Deno.PointerObject} type
 * @param {ArrayBuffer} buffer
 * @param {number} [offset]
 * @returns
 */
export function unboxArgument(type, buffer, offset) {
  const tag = g.type_info.get_tag(type);
  const dataView = new ExtendedDataView(buffer, offset);

  switch (tag) {
    case GITypeTag.VOID:
      return null;

    case GITypeTag.UNICHAR:
      return String.fromCharCode(dataView.getUint32());

    case GITypeTag.BOOLEAN:
      return Boolean(dataView.getUint8());

    case GITypeTag.UINT8:
      return dataView.getUint8();

    case GITypeTag.INT8:
      return dataView.getInt8();

    case GITypeTag.UINT16:
      return dataView.getUint16();

    case GITypeTag.INT16:
      return dataView.getInt16();

    case GITypeTag.UINT32:
      return dataView.getUint32();

    case GITypeTag.INT32:
      return dataView.getInt32();

    case GITypeTag.FLOAT:
      return dataView.getFloat32();

    case GITypeTag.UINT64:
      return dataView.getBigUint64();

    case GITypeTag.INT64:
      return dataView.getBigInt64();

    case GITypeTag.DOUBLE:
      return dataView.getFloat64();

    case GITypeTag.GTYPE:
      return dataView.getBigUint64();

    case GITypeTag.UTF8:
    case GITypeTag.FILENAME: {
      return deref_str(deref_ptr(buffer));
    }

    /* non-basic types */

    case GITypeTag.ARRAY: {
      return unboxArray(type, deref_ptr(buffer), -1);
    }

    case GITypeTag.GLIST:
    case GITypeTag.GSLIST: {
      return unboxList(type, buffer);
    }

    case GITypeTag.INTERFACE: {
      const info = g.type_info.get_interface(type);
      const result = unboxInterface(info, buffer);
      g.base_info.unref(info);
      return result;
    }

    default:
      return null;
  }
}

export function boxArgument(type, value) {
  const buffer = new ArrayBuffer(8);
  const dataView = new ExtendedDataView(buffer);
  const tag = g.type_info.get_tag(type);

  switch (tag) {
    case GITypeTag.BOOLEAN:
      dataView.setInt32(value);
      break;

    case GITypeTag.UINT8: {
      const normalized = normalizeNumber(value);
      ensure_number_range(GITypeTag.UINT8, normalized);
      dataView.setUint8(normalized);
      break;
    }

    case GITypeTag.UNICHAR:
      dataView.setUint32(String(value).codePointAt(0));
      break;

    case GITypeTag.INT8: {
      const normalized = normalizeNumber(value);
      ensure_number_range(GITypeTag.INT8, normalized);
      dataView.setInt8(normalized);
      break;
    }

    case GITypeTag.UINT16: {
      const normalized = normalizeNumber(value);
      ensure_number_range(GITypeTag.UINT16, normalized);
      dataView.setUint16(normalized);
      break;
    }

    case GITypeTag.INT16: {
      const normalized = normalizeNumber(value);
      ensure_number_range(GITypeTag.INT16, normalized);
      dataView.setInt16(normalized);
      break;
    }

    case GITypeTag.UINT32: {
      const normalized = normalizeNumber(value);
      ensure_number_range(GITypeTag.UINT32, normalized);
      dataView.setUint32(normalized);
      break;
    }

    case GITypeTag.INT32: {
      const normalized = normalizeNumber(value);
      ensure_number_range(GITypeTag.INT32, normalized);
      dataView.setInt32(normalized);
      break;
    }

    case GITypeTag.UINT64: {
      const normalized = normalizeNumber(value);
      ensure_number_range(GITypeTag.UINT64, normalized);
      dataView.setBigUint64(
        typeof normalized === "bigint" ? normalized : Math.trunc(normalized),
      );
      break;
    }

    case GITypeTag.INT64: {
      const normalized = normalizeNumber(value);
      ensure_number_range(GITypeTag.INT64, normalized);
      dataView.setBigInt64(
        typeof normalized === "bigint" ? normalized : Math.trunc(normalized),
      );
      break;
    }

    case GITypeTag.FLOAT: {
      const normalized = normalizeNumber(value, true);
      ensure_number_range(GITypeTag.FLOAT, normalized);
      dataView.setFloat32(normalized);
      break;
    }

    case GITypeTag.DOUBLE: {
      const normalized = normalizeNumber(value, true);
      ensure_number_range(GITypeTag.DOUBLE, normalized);
      dataView.setFloat64(normalized);
      break;
    }

    case GITypeTag.UTF8:
    case GITypeTag.FILENAME:
      dataView.setBigUint64(
        cast_ptr_u64(cast_buf_ptr(cast_str_buf(value))),
      );
      break;

    case GITypeTag.GTYPE:
      ensure_number_range(GITypeTag.GTYPE, value);
      dataView.setBigUint64(value);
      break;

    /* non-basic types */

    case GITypeTag.ARRAY: {
      if (Array.isArray(value)) {
        value = boxArray(type, value);
      }

      if (value) {
        dataView.setBigUint64(
          cast_ptr_u64(cast_buf_ptr(value)),
        );
      }

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

function normalizeNumber(value, allowNaN = false) {
  if (value === undefined) return 0;
  if (allowNaN && isNaN(value)) return NaN;
  return value || 0;
}
