import { cast_u64_ptr, deref_buf } from "../../base_utils/convert.ts";
import g from "../../bindings/girepository.js";
import { unboxArgument } from "../argument.js";

/**
 * @param {Deno.PointerValue} info
 * @param {ArrayBufferLike} list
 * @returns
 */
export function unboxList(info, list) {
  const paramType = g.type_info.get_param_type(info, 0);
  const result = [];

  while (true) {
    const [dataPointer, nextPointer] = new BigUint64Array(list);
    const data = deref_buf(cast_u64_ptr(dataPointer), 8);
    result.push(unboxArgument(paramType, data));

    if (!nextPointer) break;

    list = deref_buf(cast_u64_ptr(nextPointer), 8);
  }

  g.base_info.unref(paramType);
  return result;
}
