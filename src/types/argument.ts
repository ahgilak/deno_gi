import g from "../bindings/mod.ts";
import {GIInfoType, GITypeTag} from "../bindings/enums.ts";
import {
  cast_buf_ptr,
  cast_ptr_u64,
  cast_str_buf,
  cast_u64_ptr,
  deref_buf,
  deref_ptr,
  deref_str,
} from "../base_utils/convert.ts";
import {ExtendedDataView} from "../utils/dataview.js";
import {boxArray, unboxArray} from "./argument/array.ts";
import {boxInterface, getInterfaceSize, unboxInterface} from "./argument/interface.js";
import {unboxList} from "./argument/list.js";
import {ensure_number_range} from "../bindings/ranges.ts";
import "npm:reflect-metadata";
import {TypedArray} from "../base_utils/ffipp.js";

function getArgumentSize(type: Deno.PointerObject<unknown>): number | null {
  const tag = g.type_info.get_tag(type);

  switch (tag) {
    case GITypeTag.INTERFACE: {
      const info = g.type_info.get_interface(type);
      if (info === null) return null;
      return getInterfaceSize(info);
    }
    default:
      return 8;
  }
}

function initPointer(size: number) {
  return cast_buf_ptr(new Uint8Array(new ArrayBuffer(size)));
}

/**
 * @param view the view to use for initializing an argument
 * @param offset
 * @param type
 * @param n_pointers the number of deep pointers to create
 */
function initArgument(
  view: ExtendedDataView,
  offset: number,
  type: Deno.PointerObject,
  n_pointers: number,
) {
  // get the size of the argument and create various pointers
  const pointer_size = getArgumentSize(type);
  let pointer;

  if (pointer_size) pointer = initPointer(pointer_size);

  // initialize deep pointers
  for (let i = 0; i < n_pointers; i++) {
    // create a new pointer that points to the initialized value
    const new_pointer = initPointer(8);

    if (!new_pointer) throw new EvalError("Invalid pointer");

    const view = new ExtendedDataView(deref_buf(new_pointer, 8));
    if (pointer) view.setBigUint64(cast_ptr_u64(pointer));
    pointer = new_pointer;
  }

  if (pointer) {
    view.setBigUint64(cast_ptr_u64(pointer), offset);
  }
}

/** Create a new buffer for a list of items
 * @param types a list of types or a tuple with a type and number of pointers
 * @returns
 */
export function initArguments(
  ...types: ([type: Deno.PointerObject, n_pointers: number] | Deno.PointerObject)[]
) {
  const buffer = new ArrayBuffer(types.length * 8);
  const view = new ExtendedDataView(buffer);

  for (let i = 0; i < types.length; i++) {
    const element = types[i];
    let type, n_pointers = 0;

    if (Array.isArray(element)) {
      type = element[0];
      n_pointers = element[1];
    } else {
      type = element;
    }

    initArgument(view, i * 8, type, n_pointers);
  }

  return buffer;
}

function getDeepViews(
  buffer: ArrayBufferLike,
  offset: number | undefined,
  n_pointers: number,
) {
  const views = [new ExtendedDataView(buffer, offset)];

  for (let i = 0; i < n_pointers; i++) {
    const ptr = views[0].getBigUint64();
    if (ptr === 0n) {
      views.unshift(new ExtendedDataView(new ArrayBuffer(8)));
      break;
    }
    const ptr_value = cast_u64_ptr(ptr);
    if (!ptr_value) continue;
    views.unshift(new ExtendedDataView(deref_buf(ptr_value, 8)));
  }

  return views;
}

/** This function is given a pointer OR a value, and must hence extract it
 * @param type
 * @param buffer
 * @param [offset]
 * @param [n_pointers] how many times the argument is wrapped in pointers
 * @param [length] the length for arrays
 * @returns
 */
export function unboxArgument(
  type: Deno.PointerObject,
  buffer: ArrayBuffer,
  offset?: number,
  n_pointers: number = 0,
  length: number = -1,
):
  | number
  | boolean
  | bigint
  | string
  | null
  | ArrayBuffer
  | TypedArray
  | unknown[] {
  const tag = g.type_info.get_tag(type);
  const [dataView, containerView] = getDeepViews(buffer, offset, n_pointers);

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
      // containerView may be empty nPointers = 0
      const buffer = containerView?.buffer || dataView.buffer;
      return unboxArray(type, buffer, length);
    }

    case GITypeTag.GLIST:
    case GITypeTag.GSLIST: {
      return unboxList(type, buffer);
    }

    case GITypeTag.INTERFACE: {
      const info = g.type_info.get_interface(type);
      const info_type = g.base_info.get_type(info);
      let result;

      switch (info_type) {
        case GIInfoType.OBJECT:
        case GIInfoType.STRUCT:
        case GIInfoType.INTERFACE: {
          result = unboxInterface(info, buffer);
          break;
        }
        case GIInfoType.ENUM:
        case GIInfoType.FLAGS: {
          result = dataView.getInt32();
          break;
        }
        default:
          result = null;
      }

      g.base_info.unref(info);
      return result;
    }

    default:
      return null;
  }
}

export function boxArgument(
  type: Deno.PointerObject<unknown>,
  value: unknown,
  buffer = new ArrayBuffer(8),
  offset = 0,
) {
  const dataView = new ExtendedDataView(buffer, offset);
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
      if (typeof value !== "string") throw new TypeError("Expected a string");
      dataView.setBigUint64(
        cast_ptr_u64(cast_buf_ptr(cast_str_buf(value))),
      );
      break;

    case GITypeTag.GTYPE: {
      let numericValue = value;
      // quick check to get the GType of a class
      if (typeof value === "function") {
        numericValue = Reflect.getMetadata("gi:gtype", value);
      }
      if (
        typeof numericValue !== "bigint" && typeof numericValue !== "number"
      ) {
        throw new TypeError("Expected a GType or a class");
      }
      ensure_number_range(GITypeTag.GTYPE, numericValue);
      dataView.setBigUint64(numericValue);
      break;
    }

    /* non-basic types */

    case GITypeTag.ARRAY: {
      const buffer = normalizeArray(type, value);
      if (!buffer) break;

      dataView.setBigUint64(cast_ptr_u64(cast_buf_ptr(new Uint8Array(buffer))));

      break;
    }

    case GITypeTag.INTERFACE: {
      const info = g.type_info.get_interface(type);
      dataView.setBigUint64(boxInterface(info, value));
      g.base_info.unref(info);
      break;
    }
  }

  return buffer;
}

function normalizeNumber(
  value: unknown,
  allowNaN = false,
): number | bigint {
  if (value === undefined) return 0;
  if (typeof value !== "number") throw new TypeError("Expected a number");
  if (allowNaN && isNaN(value)) return NaN;
  return value || 0;
}

const typedArrays = [
  Int8Array,
  Uint8Array,
  Uint8ClampedArray,
  Int16Array,
  Uint16Array,
  Int32Array,
  Uint32Array,
  Float32Array,
  Float64Array,
  BigInt64Array,
  BigUint64Array,
];

/**
 * @param {*} value
 * @returns {value is import("../base_utils/ffipp.js").TypedArray}
 */
export function isTypedArray(
  value: unknown,
): value is TypedArray {
  return typedArrays.some((typedArray) => value instanceof typedArray);
}

/**
 * @param type
 * @param value
 */
export function normalizeArray(
  type: Deno.PointerObject,
  value: unknown,
): ArrayBuffer | null {
  if (!value) return null;

  if (typeof value === "string") {
    return boxArray(type, value.split("").map((char) => char.charCodeAt(0)));
  }

  if (Array.isArray(value) || isTypedArray(value)) {
    return boxArray(type, value);
  }

  if (value instanceof ArrayBuffer) {
    return value;
  }

  throw new TypeError(
    "Expected a string, array, ArrayBuffer or TypedArray",
  );
}
