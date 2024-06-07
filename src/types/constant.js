import g from "../bindings/mod.js";
import { unboxArgument } from "./argument.js";

export function createConstant(info) {
  const giValue = new ArrayBuffer(8);
  const giType = g.constant_info.get_type(info);
  const size = g.constant_info.get_value(info, giValue);

  if (size === 0) {
    return null;
  }

  const result = unboxArgument(giType, giValue);
  g.base_info.unref(giType);

  return result;
}
