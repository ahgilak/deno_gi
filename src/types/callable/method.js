import g from "../../bindings/mod.js";
import {createGError} from "../../utils/error.ts";
import {parseCallableArgs} from "../callable.ts";

export function createMethod(info) {
    const [parseInArgs, initOutArgs, parseOutArgs] = parseCallableArgs(
        info,
        true,
    );

    return (caller, ...args) => {
        const inArgs = parseInArgs(caller, ...args);
        const outArgs = initOutArgs();

        const error = new BigUint64Array(1);
        const returnValue = new ArrayBuffer(8);

        const success = g.function_info.invoke(
            info,
            inArgs,
            inArgs.byteLength / 8,
            outArgs,
            outArgs.byteLength / 8,
            returnValue,
            error,
        );

        if (!success) {
            if (!error[0]) {
                throw new Error(`Error invoking method ${getName(info)}`);
            }

            throw createGError(error[0]);
        }

        return parseOutArgs(returnValue, outArgs);
    };
}
