import { deref_buf } from "../../base_utils/convert.ts";
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

  while (pointer) {
    const [value, next] = new BigUint64Array(deref_buf(pointer, 16));
    result.push(unboxArgument(paramType, value));
    pointer = Deno.UnsafePointer.create(next);
  }

  g.base_info.unref(paramType);
  return result;
}
