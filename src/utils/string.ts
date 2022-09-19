import GIRepository from "../bindings/gobject-introspection/symbols.ts";
import { GIInfoType } from "../bindings/gobject-introspection/enums.ts";

export const encoder = new TextEncoder();

export function toCString(text: string) {
  return encoder.encode(text + "\0");
}

export function fromCString(pointer: Deno.PointerValue, offset = 0) {
  return Deno.UnsafePointerView.getCString(pointer, offset);
}

export function getName(info: Deno.PointerValue) {
  const name = fromCString(GIRepository.g_base_info_get_name(info));
  const type = GIRepository.g_base_info_get_type(info);

  if (
    (type === GIInfoType.GI_INFO_TYPE_FUNCTION) ||
    (type === GIInfoType.GI_INFO_TYPE_PROPERTY) ||
    (type === GIInfoType.GI_INFO_TYPE_CALLBACK) ||
    (type === GIInfoType.GI_INFO_TYPE_VFUNC)
  ) {
    return toCamelCase(name);
  }

  return name;
}

export function toSnakeCase(text: string) {
  return text.replaceAll(
    /[A-Z]/g,
    (s) => "_" + s.toLowerCase(),
  );
}

export function toKebabCase(text: string) {
  return text.replaceAll(
    /[A-Z]/g,
    (s) => "-" + s.toLowerCase(),
  );
}

export function toCamelCase(text: string) {
  return text.replaceAll(
    /[_-][a-z]/g,
    (s) => s.substring(1).toUpperCase(),
  );
}
