import GIRepository from "./bindings/gobject-introspection/symbols.ts";
import { GITypeTag } from "./bindings/gobject-introspection/enums.ts";
import { fromCString, LocalDataView, toCString } from "./utils.ts";
import { interFromValue, valueFromInter } from "./interface.ts";

// deno-lint-ignore no-explicit-any
export function convertArrayType(value: any[]) {
  if (value.length === 0) {
    return new Uint8Array(0);
  }

  switch (typeof value[0]) {
    case "string":
      return new BigUint64Array(
        value.map((v) => BigInt(Deno.UnsafePointer.of(toCString(v)))),
      );
    case "number":
      return new Int32Array(value);
    case "boolean":
      return new Int32Array(value.map((v) => Number(v)));
    case "bigint":
      return new BigInt64Array(value);
  }
}

// deno-lint-ignore no-explicit-any
export function prepareArg(type: Deno.PointerValue, value: any) {
  if (!value) return 0n;

  const arg = new ArrayBuffer(64);
  const dataView = new LocalDataView(arg);
  const tag = GIRepository.g_type_info_get_tag(type);

  switch (tag) {
    case GITypeTag.GI_TYPE_TAG_BOOLEAN:
      dataView.setInt32(value);
      break;

    case GITypeTag.GI_TYPE_TAG_UINT8:
      dataView.setUint8(value);
      break;

    case GITypeTag.GI_TYPE_TAG_INT8:
      dataView.setInt8(value);
      break;

    case GITypeTag.GI_TYPE_TAG_UINT16:
      dataView.setUint16(value);
      break;

    case GITypeTag.GI_TYPE_TAG_INT16:
      dataView.setInt16(value);
      break;

    case GITypeTag.GI_TYPE_TAG_UINT32:
      dataView.setUint32(value);
      break;

    case GITypeTag.GI_TYPE_TAG_INT32:
      dataView.setInt32(value);
      break;

    case GITypeTag.GI_TYPE_TAG_UINT64:
      dataView.setBigUint64(value);
      break;

    case GITypeTag.GI_TYPE_TAG_INT64:
      dataView.setBigInt64(value);
      break;

    case GITypeTag.GI_TYPE_TAG_FLOAT:
      dataView.setFloat32(0, value);
      break;

    case GITypeTag.GI_TYPE_TAG_DOUBLE:
      dataView.setFloat64(0, value);
      break;

    case GITypeTag.GI_TYPE_TAG_UTF8:
    case GITypeTag.GI_TYPE_TAG_FILENAME:
      return BigInt(Deno.UnsafePointer.of(toCString(value)));

    /* non-basic types */

    case GITypeTag.GI_TYPE_TAG_ARRAY: {
      if (Array.isArray(value)) {
        value = convertArrayType(value);
      }

      return BigInt(Deno.UnsafePointer.of(value));
    }

    case GITypeTag.GI_TYPE_TAG_INTERFACE: {
      const info = GIRepository.g_type_info_get_interface(type);
      const result = interFromValue(info, value);
      GIRepository.g_base_info_unref(info);
      return result;
    }
  }

  return dataView.getBigUint64();
}

export function prepareRet(type: Deno.PointerValue, buffer: ArrayBufferLike) {
  const dataView = new LocalDataView(buffer);
  const tag = GIRepository.g_type_info_get_tag(type);
  const ptr = dataView.getBigUint64();

  switch (tag) {
    case GITypeTag.GI_TYPE_TAG_VOID:
      return;

    case GITypeTag.GI_TYPE_TAG_BOOLEAN:
      return Boolean(dataView.getInt32());

    case GITypeTag.GI_TYPE_TAG_UINT8:
      return dataView.getUint8();

    case GITypeTag.GI_TYPE_TAG_INT8:
      return dataView.getInt8();

    case GITypeTag.GI_TYPE_TAG_UINT16:
      return dataView.getUint16();

    case GITypeTag.GI_TYPE_TAG_INT16:
      return dataView.getInt16();

    case GITypeTag.GI_TYPE_TAG_UINT32:
      return dataView.getUint32();

    case GITypeTag.GI_TYPE_TAG_INT32:
      return dataView.getInt32();

    case GITypeTag.GI_TYPE_TAG_UINT64:
      return dataView.getBigUint64();

    case GITypeTag.GI_TYPE_TAG_INT64:
      return dataView.getBigInt64();

    case GITypeTag.GI_TYPE_TAG_FLOAT:
      return dataView.getFloat32();

    case GITypeTag.GI_TYPE_TAG_DOUBLE:
      return dataView.getFloat64();

    case GITypeTag.GI_TYPE_TAG_UTF8:
    case GITypeTag.GI_TYPE_TAG_FILENAME: {
      if (!ptr) {
        return null;
      }

      return fromCString(ptr);
    }

    /* non-basic types */

    case GITypeTag.GI_TYPE_TAG_INTERFACE: {
      if (!ptr) {
        return null;
      }

      const info = GIRepository.g_type_info_get_interface(type);
      const result = valueFromInter(info, ptr);
      GIRepository.g_base_info_unref(info);
      return result;
    }

    default:
      return ptr;
  }
}

// deno-lint-ignore no-explicit-any
export function prepareParam(type: Deno.PointerValue, value: any) {
  const tag = GIRepository.g_type_info_get_tag(type);

  switch (tag) {
    case GITypeTag.GI_TYPE_TAG_BOOLEAN:
      return Boolean(value);

    case GITypeTag.GI_TYPE_TAG_UTF8:
    case GITypeTag.GI_TYPE_TAG_FILENAME:
      return fromCString(value);

    /* non-basic types */

    case GITypeTag.GI_TYPE_TAG_INTERFACE: {
      const info = GIRepository.g_type_info_get_interface(type);
      const result = valueFromInter(info, BigInt(value));
      GIRepository.g_base_info_unref(info);
      return result;
    }

    default:
      return value;
  }
}
