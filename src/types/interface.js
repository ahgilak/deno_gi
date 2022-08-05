import GIRepository from "../bindings/gobject-introspection/girepository.js";
import { createMethod } from "./callable.js";
import { getName } from "../utils.js";

function defineMethods(target, info) {
  const nMethods = GIRepository.g_interface_info_get_n_methods(info);

  for (let i = 0; i < nMethods; i++) {
    const methodInfo = GIRepository.g_interface_info_get_method(info, i);
    const name = getName(methodInfo);

    if (!Object.hasOwn(target, name)) {
      Object.defineProperty(target, name, {
        value: createMethod(methodInfo, target.__ref__),
      });
    }
  }
}

export function createInterface(info) {
  const result = new Object();
  defineMethods(result, info);
  GIRepository.g_base_info_unref(info);
  return result;
}
