import GIRepository from "../bindings/gobject-introspection/girepository.js";
import { prepareRet } from "../prepare.js";

export function createConstant(info) {
  const arg = new ArrayBuffer(8);
  const typeInfo = GIRepository.g_constant_info_get_type(info);

  const size = GIRepository.g_constant_info_get_value(info, arg);
  if (size === 0) {
    return null;
  }

  return prepareRet(typeInfo, arg);
}
