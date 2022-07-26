import GIRepository from "../bindings/gobject-introspection/girepository.js";
import { createConstructor, createFunction, createMethod } from "./callable.js";
import { getName } from "../utils.js";

function defineStaticMethods(target, info) {
  const nMethods = GIRepository.g_struct_info_get_n_methods(info);

  for (let i = 0; i < nMethods; i++) {
    const methodInfo = GIRepository.g_struct_info_get_method(info, i);
    const isMethod = GIRepository.g_callable_info_is_method(methodInfo);

    if (isMethod) {
      continue;
    }

    const flags = GIRepository.g_function_info_get_flags(methodInfo);

    const name = getName(methodInfo);
    const isConstructor =
      GIRepository.GIFunctionInfoFlags.GI_FUNCTION_IS_CONSTRUCTOR & flags;

    const value = isConstructor
      ? createConstructor(methodInfo, info)
      : createFunction(methodInfo);

    if (!Object.hasOwn(target, name)) {
      Object.defineProperty(target, name, {
        value,
      });
    }
  }
}

function defineMethods(target, info) {
  const nMethods = GIRepository.g_struct_info_get_n_methods(info);

  for (let i = 0; i < nMethods; i++) {
    const methodInfo = GIRepository.g_struct_info_get_method(info, i);
    const isMethod = GIRepository.g_callable_info_is_method(methodInfo);

    if (!isMethod) {
      continue;
    }

    const name = getName(methodInfo);

    if (!Object.hasOwn(target, name)) {
      Object.defineProperty(target, name, {
        value: createMethod(methodInfo, target.__ref),
        writable: false,
      });
    }
  }
}

export function createStructInstance(info, ref) {
  const result = new Object();
  Object.defineProperty(result, "__ref", { value: ref });
  defineMethods(result, info);
  GIRepository.g_base_info_unref(info);
  return result;
}

export function createStruct(info) {
  const result = new Object();
  defineStaticMethods(result, info);
  GIRepository.g_base_info_unref(info);
  return result;
}
