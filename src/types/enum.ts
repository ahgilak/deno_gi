import g from "../bindings/mod.ts";
import handleInfo from "../handleInfo.ts";

export function createEnum(info: Deno.PointerValue) {
  const result = new Object();

  const nValues = g.enum_info.get_n_values(info);

  for (let i = 0; i < nValues; i++) {
    const valueInfo = g.enum_info.get_value(info, i);
    handleInfo(result, valueInfo);
    g.base_info.unref(valueInfo);
  }

  return Object.freeze(result);
}
