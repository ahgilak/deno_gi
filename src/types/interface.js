import GIRepository from "../bindings/gobject-introspection/symbols.ts";
import { createFunction, createMethod } from "./callable.js";
import { getName } from "../utils.js";

function defineMethods(target, info) {
  const nMethods = GIRepository.g_interface_info_get_n_methods(info);

  for (let i = 0; i < nMethods; i++) {
    const methodInfo = GIRepository.g_interface_info_get_method(info, i);
    const isMethod = GIRepository.g_callable_info_is_method(methodInfo);
    const name = getName(methodInfo);

    if (isMethod) {
      if (!Object.hasOwn(target.prototype, name)) {
        Object.defineProperty(target.prototype, name, {
          value(...args) {
            return createMethod(methodInfo, this.__ref__)(...args);
          },
          writable: false,
        });
      }
    } else {
      if (!Object.hasOwn(target, name)) {
        Object.defineProperty(target, name, {
          value: createFunction(methodInfo),
        });
      }
    }
  }
}

export function createInterface(info) {
  const ResultClass = class {
    static name = getName(info);
  };

  defineMethods(ResultClass, info);
  return ResultClass;
}
