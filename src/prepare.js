import GIRepository from "./bindings/gobject-introspection/girepository.js";
import { isLittleEndian, toCString } from "./utils.js";
import { interFromValue, valueFromInter } from "./interface.js";

/**
 * @param {bigint} type
 * @param {*} value
 * @returns {bigint}
 */
export function prepareArg(type, value) {
  if (!value) return 0n;

  const arg = new BigUint64Array(1);
  const dataView = new DataView(arg.buffer);
  const tag = GIRepository.g_type_info_get_tag(type);

  switch (tag) {
    case GIRepository.GITypeTag.GI_TYPE_TAG_BOOLEAN:
      dataView.setInt32(0, Number(value), isLittleEndian);
      break;

    case GIRepository.GITypeTag.GI_TYPE_TAG_UINT8:
      dataView.setUint8(0, Number(value));
      break;

    case GIRepository.GITypeTag.GI_TYPE_TAG_INT8:
      dataView.setInt8(0, Number(value), isLittleEndian);
      break;

    case GIRepository.GITypeTag.GI_TYPE_TAG_UINT16:
      dataView.setUint16(0, Number(value), isLittleEndian);
      break;

    case GIRepository.GITypeTag.GI_TYPE_TAG_INT16:
      dataView.setInt16(0, Number(value), isLittleEndian);
      break;

    case GIRepository.GITypeTag.GI_TYPE_TAG_UINT32:
      dataView.setUint32(0, Number(value), isLittleEndian);
      break;

    case GIRepository.GITypeTag.GI_TYPE_TAG_INT32:
      dataView.setInt32(0, Number(value), isLittleEndian);
      break;

    case GIRepository.GITypeTag.GI_TYPE_TAG_UINT64:
      dataView.setBigUint64(0, BigInt(value), isLittleEndian);
      break;

    case GIRepository.GITypeTag.GI_TYPE_TAG_INT64:
      dataView.setBigInt64(0, BigInt(value), isLittleEndian);
      break;

    case GIRepository.GITypeTag.GI_TYPE_TAG_FLOAT:
      dataView.setFloat32(0, Number(value), isLittleEndian);
      break;

    case GIRepository.GITypeTag.GI_TYPE_TAG_DOUBLE:
      dataView.setFloat64(0, Number(value), isLittleEndian);
      break;

    case GIRepository.GITypeTag.GI_TYPE_TAG_UTF8:
    case GIRepository.GITypeTag.GI_TYPE_TAG_FILENAME:
      dataView.setBigUint64(
        0,
        BigInt(Deno.UnsafePointer.of(toCString(value))),
        isLittleEndian,
      );
      break;

    /* non-basic types */

    case GIRepository.GITypeTag.GI_TYPE_TAG_ARRAY: {
      dataView.setBigUint64(
        0,
        BigInt(Deno.UnsafePointer.of(value)),
        isLittleEndian,
      );

      break;
    }

    case GIRepository.GITypeTag.GI_TYPE_TAG_INTERFACE: {
      const info = GIRepository.g_type_info_get_interface(type);
      dataView.setBigUint64(
        0,
        interFromValue(info, value),
        isLittleEndian,
      );
      break;
    }
  }

  return arg.at(0);
}

/**
 * @param {bigint} type
 * @param {ArrayBufferLike} buffer
 * @returns
 */
export function prepareRet(type, buffer) {
  const dataView = new DataView(buffer);
  const tag = GIRepository.g_type_info_get_tag(type);
  const ptr = dataView.getBigUint64(0, isLittleEndian);

  switch (tag) {
    case GIRepository.GITypeTag.GI_TYPE_TAG_VOID:
      return;

    case GIRepository.GITypeTag.GI_TYPE_TAG_BOOLEAN:
      return Boolean(dataView.getInt32(0, isLittleEndian));

    case GIRepository.GITypeTag.GI_TYPE_TAG_UINT8:
      return dataView.getUint8(0);

    case GIRepository.GITypeTag.GI_TYPE_TAG_INT8:
      return dataView.getInt8(0, isLittleEndian);

    case GIRepository.GITypeTag.GI_TYPE_TAG_UINT16:
      return dataView.getUint16(0, isLittleEndian);

    case GIRepository.GITypeTag.GI_TYPE_TAG_INT16:
      return dataView.getInt16(0, isLittleEndian);

    case GIRepository.GITypeTag.GI_TYPE_TAG_UINT32:
      return dataView.getUint32(0, isLittleEndian);

    case GIRepository.GITypeTag.GI_TYPE_TAG_INT32:
      return dataView.getInt32(0, isLittleEndian);

    case GIRepository.GITypeTag.GI_TYPE_TAG_UINT64:
      return dataView.getBigUint64(0, isLittleEndian);

    case GIRepository.GITypeTag.GI_TYPE_TAG_INT64:
      return dataView.getBigInt64(0, isLittleEndian);

    case GIRepository.GITypeTag.GI_TYPE_TAG_FLOAT:
      return dataView.getFloat32(0, isLittleEndian);

    case GIRepository.GITypeTag.GI_TYPE_TAG_DOUBLE:
      return dataView.getFloat64(0, isLittleEndian);

    case GIRepository.GITypeTag.GI_TYPE_TAG_UTF8:
    case GIRepository.GITypeTag.GI_TYPE_TAG_FILENAME:
      return new Deno.UnsafePointerView(ptr).getCString();

    /* non-basic types */

    case GIRepository.GITypeTag.GI_TYPE_TAG_INTERFACE:
      return valueFromInter(
        GIRepository.g_type_info_get_interface(type),
        ptr,
      );

    default:
      return ptr;
  }
}

/**
 * @param {bigint} type
 * @param {*} value
 * @returns
 */
export function prepareParam(type, value) {
  const tag = GIRepository.g_type_info_get_tag(type);

  switch (tag) {
    case GIRepository.GITypeTag.GI_TYPE_TAG_BOOLEAN:
      return Boolean(value);

    case GIRepository.GITypeTag.GI_TYPE_TAG_UTF8:
    case GIRepository.GITypeTag.GI_TYPE_TAG_FILENAME:
      return new Deno.UnsafePointerView(value).getCString();

    /* non-basic types */

    case GIRepository.GITypeTag.GI_TYPE_TAG_INTERFACE:
      return valueFromInter(
        GIRepository.g_type_info_get_interface(type),
        value,
      );

    default:
      return value;
  }
}
