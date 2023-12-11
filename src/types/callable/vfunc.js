import g from "../../bindings/mod.js";
import { cast_ptr_u64 } from "../../base_utils/convert.ts";
import { createGError } from "../../utils/error.ts";
import { unboxArgument } from "../argument.js";
import { parseCallableArgs } from "../callable.js";

export function createVFunc(info) {
  const returnType = g.callable_info.get_return_type(info);

  const [parseInArgs, initOutArgs, parseOutArgs] = parseCallableArgs(info);

  return (caller, implimentor, ...args) => {
    const inArgs = parseInArgs(...args);
    const outArgs = initOutArgs();

    inArgs.unshift(cast_ptr_u64(caller));

    const error = new ArrayBuffer(8);
    const returnValue = new ArrayBuffer(8);

    const success = g.vfunc_info.invoke(
      info,
      implimentor,
      new BigUint64Array(inArgs),
      inArgs.length,
      new BigUint64Array(outArgs),
      outArgs.length,
      returnValue,
      error,
    );

    if (!success) {
      throw createGError(error);
    }

    const retVal = unboxArgument(returnType, returnValue);

    if (outArgs.length > 0) {
      return [retVal, ...parseOutArgs(outArgs)];
    }

    return retVal;
  };
}
