import g from "../../bindings/mod.js";
import { getName } from "../../utils/string.ts";
import { unboxArgument } from "../argument.js";
import { parseCallableArgs } from "../callable.js";

export function createFunction(info) {
  const returnType = g.callable_info.get_return_type(info);
  const [parseInArgs, initOutArgs, parseOutArgs] = parseCallableArgs(info);

  return (...args) => {
    const inArgs = parseInArgs(...args);
    const outArgs = initOutArgs();

    const error = new ArrayBuffer(16);
    const returnValue = new ArrayBuffer(8);

    const success = g.function_info.invoke(
      info,
      new BigUint64Array(inArgs),
      inArgs.length,
      new BigUint64Array(0),
      0,
      returnValue,
      error,
    );

    if (!success) {
      console.error(`Error invoking function ${getName(info)}`);
      return;
    }

    const retVal = unboxArgument(returnType, returnValue);

    if (outArgs.length > 0) {
      return [retVal, ...parseOutArgs(outArgs)];
    }

    return retVal;
  };
}
