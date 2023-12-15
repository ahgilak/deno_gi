import { cast_u64_ptr, deref_buf } from "../../base_utils/convert.ts";
import g from "../../bindings/girepository.js";
import { ExtendedDataView } from "../../utils/dataview.js";
import { unboxArgument } from "../argument.js";

function getPointerUint64(pointer, offset) {
  return new ExtendedDataView(deref_buf(cast_u64_ptr(pointer), 8, offset))
    .getBigUint64();
}

/**
 * @param {Deno.PointerValue} info
 * @param {ArrayBufferLike} list
 * @returns
 */
export function unboxList(info, pointer) {
  const paramType = g.type_info.get_param_type(info, 0);
  const result = [];

  let i = 0;
  while (getPointerUint64(pointer, i * 8) !== 0) {
    const value = getPointerUint64(pointer, i * 8);
    result.push(unboxArgument(paramType, value));
    i++;
  }

  g.base_info.unref(paramType);
  return result;
}
