// deno-lint-ignore-file no-explicit-any

import GIRepository from "../bindings/gobject-introspection/symbols.ts";
import GObject from "../bindings/gobject/symbols.ts";
import { GITypeTag } from "../bindings/gobject-introspection/enums.ts";
import { LocalDataView } from "../utils/dataView.ts";
import { fromCString, toCString } from "../utils/string.ts";
import { getGType, getTypeSize } from "../utils/type.ts";
import { GIInfoType } from "../bindings/gobject-introspection/enums.ts";
import { createCallback } from "../types/callback.ts";
import { GValueToGIArgument } from "../types/value.ts";
import { ObjectByGType } from "../utils/object.ts";

export function JS2GIArray(typeInfo: Deno.PointerValue, values: any[]) {
  const isZeroTerminated = GIRepository.g_type_info_is_zero_terminated(
    typeInfo,
  );

  const paramType = GIRepository.g_type_info_get_param_type(typeInfo, 0);
  const paramTypeTag = GIRepository.g_type_info_get_tag(paramType);
  const paramSize = getTypeSize(paramTypeTag);

  const giValues = new Uint8Array(
    (values.length + isZeroTerminated) * paramSize,
  );

  for (let i = 0; i < values.length; i++) {
    giValues.set(
      new Uint8Array(JSToGIArgument(paramType, values[i])),
      i * paramSize,
    );
  }

  GIRepository.g_base_info_unref(paramType);

  return giValues;
}

export function GIArrayToJS(type: any, value: any, length: any): any {
  const isZeroTerminated = length === -1;
  const pointer = new BigUint64Array(value).at(0);

  if (!pointer) {
    return null;
  }

  const paramType = GIRepository.g_type_info_get_param_type(type, 0);
  const paramTypeTag = GIRepository.g_type_info_get_tag(paramType);
  const paramSize = getTypeSize(paramTypeTag);

  const pointerView = new Deno.UnsafePointerView(pointer);

  if (isZeroTerminated) {
    const result: any = [];
    for (let i = 0; pointerView.getUint8(i * paramSize) !== 0; i++) {
      result.push(
        GIArgumentToJS(
          paramType,
          pointerView.getArrayBuffer(paramSize, i * paramSize),
        ),
      );
    }

    GIRepository.g_base_info_unref(paramType);

    return result;
  }

  const buffer = pointerView.getArrayBuffer(length);
  const tag = GIRepository.g_type_info_get_tag(paramType);

  GIRepository.g_base_info_unref(paramType);

  switch (tag) {
    case GITypeTag.GI_TYPE_TAG_UINT8:
      return new Uint8Array(buffer);
    case GITypeTag.GI_TYPE_TAG_INT8:
      return new Int8Array(buffer);
    case GITypeTag.GI_TYPE_TAG_UINT16:
      return new Uint16Array(buffer);
    case GITypeTag.GI_TYPE_TAG_INT16:
      return new Int16Array(buffer);
    case GITypeTag.GI_TYPE_TAG_UINT32:
      return new Uint32Array(buffer);
    case GITypeTag.GI_TYPE_TAG_INT32:
      return new Int32Array(buffer);
    case GITypeTag.GI_TYPE_TAG_UINT64:
      return new BigUint64Array(buffer);
    case GITypeTag.GI_TYPE_TAG_INT64:
      return new BigInt64Array(buffer);
    case GITypeTag.GI_TYPE_TAG_FLOAT:
      return new Float32Array(buffer);
    case GITypeTag.GI_TYPE_TAG_DOUBLE:
      return new Float64Array(buffer);
  }
}

function GSListToJS(typeInfo: Deno.PointerValue, list: ArrayBuffer): any[] {
  const paramType = GIRepository.g_type_info_get_param_type(typeInfo, 0);
  const result = [];

  while (true) {
    const [dataPointer, nextPointer] = new BigUint64Array(list);
    const data = Deno.UnsafePointerView.getArrayBuffer(dataPointer, 8);
    result.push(GIArgumentToJS(paramType, data));

    if (!nextPointer) {
      break;
    }

    list = Deno.UnsafePointerView.getArrayBuffer(nextPointer, 8);
  }

  GIRepository.g_base_info_unref(paramType);
  return result;
}

export function JSToGIArgument(
  type: Deno.PointerValue,
  value: any,
): ArrayBuffer {
  const buffer = new ArrayBuffer(8);
  if (!value) return buffer;
  const dataView = new LocalDataView(buffer);
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
      dataView.setBigUint64(Deno.UnsafePointer.of(toCString(value)));
      break;

    case GITypeTag.GI_TYPE_TAG_GTYPE:
      dataView.setBigUint64(value.__gtype__ || value);
      break;

    /* non-basic types */

    case GITypeTag.GI_TYPE_TAG_ARRAY: {
      if (Array.isArray(value)) {
        value = JS2GIArray(type, value);
      }

      dataView.setBigUint64(Deno.UnsafePointer.of(value));
      break;
    }

    case GITypeTag.GI_TYPE_TAG_INTERFACE: {
      const info = GIRepository.g_type_info_get_interface(type);
      dataView.setBigUint64(JSToGIInterface(info, value));
      GIRepository.g_base_info_unref(info);
      break;
    }
  }

  return buffer;
}

export function GIArgumentToJS(
  giType: Deno.PointerValue,
  giValue: ArrayBufferLike,
) {
  const dataView = new LocalDataView(giValue);
  const tag = GIRepository.g_type_info_get_tag(giType);
  const pointer = dataView.getBigUint64();

  switch (tag) {
    case GITypeTag.GI_TYPE_TAG_VOID:
      return;

    case GITypeTag.GI_TYPE_TAG_UNICHAR:
      return String.fromCharCode(dataView.getUint8());

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
      if (!pointer) {
        return null;
      }

      return fromCString(pointer);
    }

    /* non-basic types */

    case GITypeTag.GI_TYPE_TAG_ARRAY: {
      return GIArrayToJS(giType, giValue, -1);
    }

    case GITypeTag.GI_TYPE_TAG_GLIST:
    case GITypeTag.GI_TYPE_TAG_GSLIST: {
      return GSListToJS(giType, giValue);
    }

    case GITypeTag.GI_TYPE_TAG_INTERFACE: {
      if (!pointer) {
        return null;
      }

      const info = GIRepository.g_type_info_get_interface(giType);
      const result = GIInterfaceToJS(info, giValue);
      GIRepository.g_base_info_unref(info);
      return result;
    }

    default:
      return pointer;
  }
}

export function JSToGIInterface(
  info: Deno.PointerValue,
  value: any,
): Deno.PointerValue {
  const type = GIRepository.g_base_info_get_type(info);
  switch (type) {
    case GIInfoType.GI_INFO_TYPE_OBJECT:
    case GIInfoType.GI_INFO_TYPE_INTERFACE:
    case GIInfoType.GI_INFO_TYPE_STRUCT:
      return value.__ref__;
    case GIInfoType.GI_INFO_TYPE_ENUM:
    case GIInfoType.GI_INFO_TYPE_FLAGS:
      return value;
    case GIInfoType.GI_INFO_TYPE_CALLBACK:
      return createCallback(info, value).pointer;
    default:
      return value;
  }
}

export function GIInterfaceToJS(
  info: Deno.PointerValue,
  giValue: ArrayBufferLike,
) {
  const dataView = new LocalDataView(giValue);
  const type = GIRepository.g_base_info_get_type(info);
  let gType = getGType(info);
  let value = dataView.getBigUint64();

  if (gType == GObject.g_value_get_type()) {
    const buffer = new BigUint64Array(
      Deno.UnsafePointerView.getArrayBuffer(value, 24),
    );

    gType = buffer.at(0)!;
    value = BigInt(GValueToGIArgument(buffer, gType)!);
    dataView.buffer = new BigUint64Array([value]).buffer;
  }

  switch (type) {
    case GIInfoType.GI_INFO_TYPE_OBJECT:
    case GIInfoType.GI_INFO_TYPE_STRUCT:
    case GIInfoType.GI_INFO_TYPE_INTERFACE:
      return Object.create(
        ObjectByGType(gType).prototype,
        { __ref__: { value } },
      );

    case GIInfoType.GI_INFO_TYPE_ENUM:
    case GIInfoType.GI_INFO_TYPE_FLAGS:
      return dataView.getInt32();
  }
}
