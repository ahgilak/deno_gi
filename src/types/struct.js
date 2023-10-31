import g from "../bindings/mod.js";
import { cast_buf_ptr } from "../base_utils/convert.ts";
import { getName } from "../utils/string.ts";
import { handleCallable } from "./callable.js";

function defineMethods(target, info) {
  const nMethods = g.struct_info.get_n_methods(info);

  for (let i = 0; i < nMethods; i++) {
    const methodInfo = g.struct_info.get_method(info, i);
    handleCallable(target, methodInfo);
  }
}

export function createStruct(info) {
  const size = g.struct_info.get_size(info);

  const ObjectClass = class {
    constructor() {
      Reflect.defineMetadata(
        "gi:ref",
        cast_buf_ptr(new ArrayBuffer(size)),
        this,
      );
    }
  };

  Object.defineProperty(ObjectClass, "name", {
    value: getName(info),
  });

  defineMethods(ObjectClass, info);

  return ObjectClass;
}
