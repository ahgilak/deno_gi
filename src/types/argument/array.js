import { cast_u64_ptr, deref_buf } from "../../base_utils/convert.ts";
import { GITypeTag } from "../../bindings/enums.ts";
import g from "../../bindings/mod.js";
import { ExtendedDataView } from "../../utils/dataview.js";
import { boxArgument, unboxArgument } from "../argument.js";

function getTypeSize(typeTag) {
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

export function unboxArray(type, value, length) {
  const isZeroTerminated = length === -1;
  const pointer = cast_u64_ptr(new ExtendedDataView(value).getBigUint64());

  if (!pointer) {
    return null;
  }

  const paramType = g.type_info.get_param_type(type, 0);
  const paramTypeTag = g.type_info.get_tag(paramType);
  const paramSize = getTypeSize(paramTypeTag);

  if (isZeroTerminated) {
    const result = [];
    for (
      let i = 0;
      new ExtendedDataView(deref_buf(pointer, 1, i * paramSize))
        .getUint8() !== 0;
      i++
    ) {
      result.push(
        unboxArgument(
          paramType,
          deref_buf(pointer, paramSize, i * paramSize),
        ),
      );
    }

    g.base_info.unref(paramType);

    return result;
  }

  const buffer = deref_buf(pointer, length);
  const tag = g.type_info.get_tag(paramType);

  g.base_info.unref(paramType);

  switch (tag) {
    case GITypeTag.UINT8:
      return new Uint8Array(buffer);
    case GITypeTag.INT8:
      return new Int8Array(buffer);
    case GITypeTag.UINT16:
      return new Uint16Array(buffer);
    case GITypeTag.INT16:
      return new Int16Array(buffer);
    case GITypeTag.UINT32:
      return new Uint32Array(buffer);
    case GITypeTag.INT32:
      return new Int32Array(buffer);
    case GITypeTag.UINT64:
      return new BigUint64Array(buffer);
    case GITypeTag.INT64:
      return new BigInt64Array(buffer);
    case GITypeTag.FLOAT:
      return new Float32Array(buffer);
    case GITypeTag.DOUBLE:
      return new Float64Array(buffer);
  }
}

export function boxArray(typeInfo, values) {
  const isZeroTerminated = g.type_info.is_zero_terminated(typeInfo);

  const paramType = g.type_info.get_param_type(typeInfo, 0);
  const paramTypeTag = g.type_info.get_tag(paramType);
  const paramSize = getTypeSize(paramTypeTag);

  const giValues = new Uint8Array(
    (values.length + isZeroTerminated) * paramSize,
  );

  for (let i = 0; i < values.length; i++) {
    giValues.set(
      new Uint8Array(boxArgument(paramType, values[i])),
      i * paramSize,
    );
  }

  g.base_info.unref(paramType);

  return giValues;
}
