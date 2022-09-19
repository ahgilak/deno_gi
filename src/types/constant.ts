import GIRepository from "../bindings/gobject-introspection/symbols.ts";
import { GIArgumentToJS } from "./argument.ts";

export function createConstant(info: Deno.PointerValue) {
  const giValue = new BigUint64Array(1);
  const giType = GIRepository.g_constant_info_get_type(info);
  const size = GIRepository.g_constant_info_get_value(info, giValue);

  if (size === 0) {
    return null;
  }

  const result = GIArgumentToJS(giType, giValue.buffer);
  GIRepository.g_base_info_unref(giType);

  return result;
}
