import { GITypeTag } from "../../bindings/enums.js";
import g from "../../bindings/mod.js";
import { createGError } from "../../utils/error.ts";
import { unboxArgument } from "../argument.js";
import { parseCallableArgs } from "../callable.js";

export function createFunction(info) {
  const returnType = g.callable_info.get_return_type(info);
  const [parseInArgs, initOutArgs, parseOutArgs] = parseCallableArgs(info);

  return (...args) => {
    const inArgs = parseInArgs(...args);
    const outArgs = initOutArgs();

    const error = new ArrayBuffer(8);
    const returnValue = new ArrayBuffer(8);

    const success = g.function_info.invoke(
      info,
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
      const parsedOutArgs = parseOutArgs(outArgs);

      // don't include a return value if it's void
      if (g.type_info.get_tag(returnType) !== GITypeTag.VOID) {
        return [retVal, ...parsedOutArgs];
      } else if (parsedOutArgs.length === 1) {
        return parsedOutArgs[0];
      } else {
        return parsedOutArgs;
      }
    }

    return retVal;
  };
}
