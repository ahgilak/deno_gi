import g from "../bindings/mod.ts";
import { unboxArgument } from "./argument.ts";

export function createConstant(info) {
  const giValue = new BigUint64Array(1);
  const giType = g.constant_info.get_type(info);
  const size = g.constant_info.get_value(info, giValue);

  if (size === 0) {
    return null;
  }

  const result = unboxArgument(giType, giValue.buffer);
  g.base_info.unref(giType);

  return result;
}
