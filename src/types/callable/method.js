import g from "../../bindings/mod.js";
import { cast_ptr_u64 } from "../../base_utils/convert.ts";
import { createGError } from "../../utils/error.ts";
import { unboxArgument } from "../argument.js";
import { parseCallableArgs } from "../callable.js";

export function createMethod(info) {
  const returnType = g.callable_info.get_return_type(info);

  const [parseInArgs, initOutArgs, parseOutArgs] = parseCallableArgs(info);

  return (caller, ...args) => {
    const inArgs = parseInArgs(...args);
    const outArgs = initOutArgs();

    inArgs.unshift(cast_ptr_u64(caller));

    const error = new BigUint64Array(1);
    const returnValue = new BigUint64Array(1);

    const success = g.function_info.invoke(
      info,
      new BigUint64Array(inArgs),
      inArgs.length,
      outArgs,
      outArgs.length,
      returnValue,
      error,
    );

    if (!success) {
      if (!error[0]) {
        throw new Error(`Error invoking method ${getName(info)}`);
      }

      throw createGError(error[0]);
    }

    const retVal = unboxArgument(returnType, returnValue[0]);

    if (outArgs.length > 0) {
      return [retVal, ...parseOutArgs(outArgs)];
    }

    return retVal;
  };
}
