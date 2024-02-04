import { cast_u64_ptr, deref_buf } from "../../base_utils/convert.ts";
import g from "../../bindings/girepository.js";
import { unboxArgument } from "../argument.js";

/**
 * @param {Deno.PointerValue} info
 * @param {BigInt} pointer
 * @returns
 */
export function unboxList(info, pointer) {
  const paramType = g.type_info.get_param_type(info, 0);
  const result = [];

  let value, next = pointer;
  while (next) {
    [value, next] = new BigUint64Array(deref_buf(cast_u64_ptr(next), 16));
    result.push(unboxArgument(paramType, value));
  }

  g.base_info.unref(paramType);
  return result;
}
