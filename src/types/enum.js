import GIRepository from "../bindings/gobject-introspection/girepository.js";
import { getName } from "../utils.js";

export function createEnum(info) {
  const result = new Object();

  const nValues = GIRepository.g_enum_info_get_n_values(info);

  for (let i = 0; i < nValues; i++) {
    const valueInfo = GIRepository.g_enum_info_get_value(info, i);
    const value = GIRepository.g_value_info_get_value(valueInfo);
    const name = getName(valueInfo).toUpperCase();
    result[name] = Number(value);
  }

  return Object.freeze(result);
}
