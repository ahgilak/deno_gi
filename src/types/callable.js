import GIRepository from "../bindings/gobject-introspection/girepository.js";
import { prepareArg, prepareRet } from "../prepare.js";
import { valueFromInter } from "../interface.js";

function createCallable({
  objectInfo,
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
        argDirection === GIRepository.GIDirection.GI_DIRECTION_IN ||
        argDirection === GIRepository.GIDirection.GI_DIRECTION_INOUT
      ) {
        inArgs.push(arg);
      }
      if (
        argDirection === GIRepository.GIDirection.GI_DIRECTION_OUT ||
        argDirection === GIRepository.GIDirection.GI_DIRECTION_INOUT
      ) {
        outArgs.push(arg);
      }
      GIRepository.g_base_info_unref(argInfo);
      GIRepository.g_base_info_unref(argType);
    }

    const retVal = new BigUint64Array(1);

    GIRepository.g_function_info_invoke(
      methodInfo,
      new BigUint64Array(inArgs),
      inArgs.length,
      new BigUint64Array(outArgs),
      outArgs.length,
      retVal,
      null,
    );

    return objectInfo
      ? valueFromInter(objectInfo, retVal.at(0))
      : prepareRet(retType, retVal.buffer);
  };
}

export function createMethod(methodInfo, selfRef) {
  return createCallable({ methodInfo, selfRef });
}

export function createFunction(methodInfo) {
  return createCallable({ methodInfo });
}

export function createConstructor(methodInfo, objectInfo) {
  return createCallable({ methodInfo, objectInfo });
}
