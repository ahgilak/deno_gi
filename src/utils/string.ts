import g from "../bindings/mod.js";
import { GIInfoType } from "../bindings/enums.ts";

export function getName(info: Deno.PointerValue) {
  const name = g.base_info.get_name(info)!;
  const type = g.base_info.get_type(info);

  if (
    type === GIInfoType.FUNCTION ||
    type === GIInfoType.PROPERTY ||
    type === GIInfoType.CALLBACK ||
    type === GIInfoType.VFUNC
  ) {
    return toCamelCase(name);
  }

  if (type === GIInfoType.VALUE) {
    return name.toUpperCase();
  }

  return name;
}

export function toSnakeCase(text: string) {
  return text.replaceAll(/[A-Z]/g, (s) => "_" + s.toLowerCase());
}

export function toKebabCase(text: string) {
  return text.replaceAll(/[A-Z]/g, (s) => "-" + s.toLowerCase());
}

export function toCamelCase(text: string) {
  return text.replaceAll(/[_-][a-z]/g, (s) => s.substring(1).toUpperCase());
}
