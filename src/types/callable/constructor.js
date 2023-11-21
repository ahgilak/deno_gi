import g from "../../bindings/mod.js";
import { cast_u64_ptr } from "../../base_utils/convert.ts";
import { ExtendedDataView } from "../../utils/dataview.js";
import { getName } from "../../utils/string.ts";
import { parseCallableArgs } from "../callable.js";

export function createConstructor(info, prototype) {
  const [parseInArgs] = parseCallableArgs(info);

  return (...args) => {
    const inArgs = parseInArgs(...args);

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
    }

    const result = Object.create(prototype);

    Reflect.defineMetadata(
      "gi:ref",
      cast_u64_ptr(new ExtendedDataView(returnValue).getBigUint64()),
      result,
    );

    return result;
  };
}
