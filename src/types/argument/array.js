import { cast_u64_ptr, deref_buf } from "../../base_utils/convert.ts";
import { GITypeTag } from "../../bindings/enums.js";
import g from "../../bindings/mod.js";
import { ExtendedDataView } from "../../utils/dataview.js";
import { boxArgument } from "../argument.js";

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

function getArrayElement(pointer, tag, i) {
  const paramSize = getTypeSize(tag);
  const dataView = new ExtendedDataView(
    deref_buf(pointer, paramSize, i * paramSize),
  );

  switch (tag) {
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
    case GITypeTag.UINT64:
      return dataView.getBigUint64();
    case GITypeTag.INT64:
      return dataView.getBigInt64();
    case GITypeTag.FLOAT:
      return dataView.getFloat32();
    case GITypeTag.DOUBLE:
      return dataView.getFloat64();
  }
}

export function unboxArray(type, array, length = -1) {
  if (!array) return null;

  const pointer = cast_u64_ptr(array);

  const paramType = g.type_info.get_param_type(type, 0);
  const paramTag = g.type_info.get_tag(paramType);
  g.base_info.unref(paramType);

  let buffer;

  // manually get the length of the array
  // TODO: investigate why some methods don't set the size data (it's kept to 0)
  if (length === -1 || length === 0n) {
    let i = 0;
    while (getArrayElement(pointer, paramTag, i) !== 0) i++;

    length = i * getTypeSize(paramTag);
  }

  if (length <= 0) {
    // empty array, just return an empty TypedArray instead of returning null
    buffer = null;
  } else {
    buffer = deref_buf(pointer, length);
  }

  switch (paramTag) {
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
