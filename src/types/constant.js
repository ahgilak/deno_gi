import GIRepository from "../bindings/gobject-introspection/symbols.ts";
import { prepareRet } from "../prepare.ts";

export function createConstant(info) {
  const arg = new ArrayBuffer(8);
  const typeInfo = GIRepository.g_constant_info_get_type(info);

  const size = GIRepository.g_constant_info_get_value(
    info,
    Deno.UnsafePointer.of(arg),
  );
  if (size === 0) {
    return null;
  }

  return prepareRet(typeInfo, arg);
}
