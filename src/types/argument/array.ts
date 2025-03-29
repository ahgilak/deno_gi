import {deref_buf, deref_ptr} from "../../base_utils/convert.ts";
import {GITypeTag} from "../../bindings/enums.ts";
import g from "../../bindings/mod.ts";
import {boxArgument, unboxArgument} from "../argument.ts";
import {TypedArray} from "../../base_utils/ffipp.ts";

export function getTypeSize(typeTag: number) {
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

export function unboxArray(
  type: Deno.PointerValue,
  buffer: ArrayBufferLike,
  length: number,
): unknown[] | null {
  if (!buffer) return null;

  const ptr = deref_ptr(buffer);

  if (!ptr) return null;

  const paramType = g.type_info.get_param_type(type, 0);
  const paramTypeTag = g.type_info.get_tag(paramType);
  const paramSize = getTypeSize(paramTypeTag);

  const result = [];

  for (let i = 0; (i < length) || (length === -1); i++) {
    const paramBuffer = deref_buf(ptr, paramSize, i * paramSize);
    if (paramType === null) throw new TypeError("paramType is null");
    const value = unboxArgument(paramType, paramBuffer);
    if (length === -1 && !value) break;
    result.push(value);
  }

  return result;
}

export function boxArray(
  typeInfo: Deno.PointerValue,
  values: unknown[] | TypedArray,
): ArrayBuffer {
  const isZeroTerminated = g.type_info.is_zero_terminated(typeInfo);

  const paramType = g.type_info.get_param_type(typeInfo, 0);
  const paramTypeTag = g.type_info.get_tag(paramType);
  const paramSize = getTypeSize(paramTypeTag);

  const buffer = new ArrayBuffer(
    (values.length + +isZeroTerminated) * paramSize,
  );

  for (let i = 0; i < values.length; i++) {
    const element = values[i];
    try {
      boxArgument(paramType, element, buffer, i * paramSize);
    } catch (error) {
      if (error instanceof Error) {
        error.message += ` (element ${i})`;
      }

      throw error;
    }
  }

  g.base_info.unref(paramType);

  return buffer;
}
