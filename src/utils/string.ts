import g from "../bindings/mod.ts";
import {GIInfoType} from "../bindings/enums.ts";

export function getName(info: Deno.PointerValue) {
  const name = g.base_info.get_name(info)!;
  const type = g.base_info.get_type(info);

  if (type === GIInfoType.VFUNC) {
    return "vfunc_" + name;
  }

  if (type === GIInfoType.VALUE) {
    return name.toUpperCase();
  }

  return name;
}

export function getDisplayName(info: Deno.PointerValue) {
  return g.base_info.get_namespace(info) + "." + g.base_info.get_name(info);
}
