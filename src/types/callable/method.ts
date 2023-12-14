import g from "../../bindings/mod.ts";
import { cast_ptr_u64 } from "../../base_utils/convert.ts";
import { getName } from "../../utils/string.ts";
import { unboxArgument } from "../argument.ts";
import { parseCallableArgs } from "../callable.ts";

export function createMethod(info: Deno.PointerValue) {
  const returnType = g.callable_info.get_return_type(info)!;

  const [parseInArgs, initOutArgs, parseOutArgs] = parseCallableArgs(info);

  return (caller: Deno.PointerObject, ...args: unknown[]) => {
    const inArgs = parseInArgs(...args);
    const outArgs = initOutArgs();

    inArgs.unshift(cast_ptr_u64(caller));

    const error = new ArrayBuffer(16);
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
      console.error(`Error invoking method ${getName(info)}`);
      return;
    }

    const retVal = unboxArgument(returnType, returnValue);

    if (outArgs.length > 0) {
      return [retVal, ...parseOutArgs(outArgs)];
    }

    return retVal;
  };
}
