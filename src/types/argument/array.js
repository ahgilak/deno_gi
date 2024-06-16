import { deref_buf, deref_ptr } from "../../base_utils/convert.ts";
import { GITypeTag } from "../../bindings/enums.js";
import g from "../../bindings/mod.js";
import { boxArgument, unboxArgument } from "../argument.js";

/**
 * @param {number} typeTag
 * @returns {number}
 */
export function getTypeSize(typeTag) {
  switch (typeTag) {
    case GITypeTag.BOOLEAN:
      return 1 << 2;

    case GITypeTag.UINT8:
    case GITypeTag.INT8:
      return 1;

    case GITypeTag.UINT16:
    case GITypeTag.INT16:
      return 1 << 1;

    case GITypeTag.UINT32:
    case GITypeTag.INT32:
      return 1 << 2;

    case GITypeTag.UINT64:
    case GITypeTag.INT64:
      return 1 << 3;

    case GITypeTag.FLOAT:
      return 1 << 2;

    case GITypeTag.DOUBLE:
      return 1 << 3;

    default:
      return 1 << 3;
  }
}

/**
 * @param {Deno.PointerValue} type
 * @param {ArrayBuffer} buffer
 * @param {number} length
 * @returns {import("../../base_utils/ffipp.d.ts").TypedArray}
 */
export function unboxArray(type, buffer, length) {
  if (!buffer) return null;

  const paramType = g.type_info.get_param_type(type, 0);
  const paramTypeTag = g.type_info.get_tag(paramType);
  const paramSize = getTypeSize(paramTypeTag);

  const result = [];

  for (let i = 0; (i < length) || (length === -1); i++) {
    const paramBuffer = deref_buf(deref_ptr(buffer), paramSize, i * paramSize);
    const value = unboxArgument(paramType, paramBuffer);
    if (length === -1 && !value) break;
    result.push(value);
  }

  return result;
}

/**
 * @param {Deno.PointerValue} typeInfo
 * @param {any[]} values
 * @returns {Uint8Array}
 */
export function boxArray(typeInfo, values) {
  const isZeroTerminated = g.type_info.is_zero_terminated(typeInfo);

  const paramType = g.type_info.get_param_type(typeInfo, 0);
  const paramTypeTag = g.type_info.get_tag(paramType);
  const paramSize = getTypeSize(paramTypeTag);

  const buffer = new ArrayBuffer(
    (values.length + isZeroTerminated) * paramSize,
  );

  for (let i = 0; i < values.length; i++) {
    const element = values[i];
    boxArgument(paramType, element, buffer, i * paramSize);
  }

  g.base_info.unref(paramType);

  return buffer;
}
