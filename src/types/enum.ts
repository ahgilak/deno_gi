import GIRepository from "../bindings/gobject-introspection/symbols.ts";
import { getName } from "../utils/string.ts";

export function createEnum(info: Deno.PointerValue) {
  const result = new Object();

  const nValues = GIRepository.g_enum_info_get_n_values(info);

  for (let i = 0; i < nValues; i++) {
    const valueInfo = GIRepository.g_enum_info_get_value(info, i);
    const value = GIRepository.g_value_info_get_value(valueInfo);
    const name = getName(valueInfo).toUpperCase();

    Object.defineProperty(result, name, {
      enumerable: true,
      value: Number(value),
    });

    GIRepository.g_base_info_unref(valueInfo);
  }

  return Object.freeze(result);
}
