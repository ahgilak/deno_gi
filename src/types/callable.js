import GIRepository from "../bindings/gobject-introspection/symbols.ts";
import { GIDirection } from "../bindings/gobject-introspection/enums.ts";
import { prepareArg, prepareRet } from "../prepare.ts";
import { LocalDataView } from "../utils.ts";

function createCallable({
  targetClass,
  methodInfo,
  selfRef,
}) {
  const nArgs = GIRepository.g_callable_info_get_n_args(methodInfo);
  const retType = GIRepository.g_callable_info_get_return_type(methodInfo);

  return function (...args) {
    const inArgs = selfRef ? [selfRef] : [];
    const outArgs = [];

    for (let i = 0; i < nArgs; i++) {
      const argInfo = GIRepository.g_callable_info_get_arg(methodInfo, i);
      const argType = GIRepository.g_arg_info_get_type(argInfo);
      const argDirection = GIRepository.g_arg_info_get_direction(argInfo);
      const arg = prepareArg(argType, args[i]);
      if (
        argDirection === GIDirection.GI_DIRECTION_IN ||
        argDirection === GIDirection.GI_DIRECTION_INOUT
      ) {
        inArgs.push(arg);
      }
      if (
        argDirection === GIDirection.GI_DIRECTION_OUT ||
        argDirection === GIDirection.GI_DIRECTION_INOUT
      ) {
        outArgs.push(arg);
      }
      GIRepository.g_base_info_unref(argInfo);
      GIRepository.g_base_info_unref(argType);
    }

    const retVal = new ArrayBuffer(64);

    GIRepository.g_function_info_invoke(
      methodInfo,
      new BigUint64Array(inArgs),
      inArgs.length,
      new BigUint64Array(outArgs),
      outArgs.length,
      Deno.UnsafePointer.of(retVal),
      null,
    );

    if (targetClass) {
      return Object.create(
        targetClass.prototype,
        { __ref__: { value: new LocalDataView(retVal).getBigUint64() } },
      );
    }

    return prepareRet(retType, retVal);
  };
}

export function createMethod(methodInfo, selfRef) {
  return createCallable({ methodInfo, selfRef });
}

export function createFunction(methodInfo) {
  return createCallable({ methodInfo });
}

export function createConstructor(methodInfo, targetClass) {
  return createCallable({ methodInfo, targetClass });
}
