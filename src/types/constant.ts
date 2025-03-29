import g from "../bindings/mod.ts";
import {unboxArgument} from "./argument.ts";

export function createConstant(info: unknown) {
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
