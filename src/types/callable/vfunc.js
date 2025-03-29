import g from "../../bindings/mod.js";
import {cast_ptr_u64} from "../../base_utils/convert.ts";
import {createGError} from "../../utils/error.ts";
import {parseCallableArgs} from "../callable.ts";

export function createVFunc(info) {
    const [parseInArgs, initOutArgs, parseOutArgs] = parseCallableArgs(info);

    return (caller, implimentor, ...args) => {
        const inArgs = parseInArgs(...args);
        const outArgs = initOutArgs();

        inArgs.unshift(cast_ptr_u64(caller));

        const error = new BigUint64Array(1);
        const returnValue = new ArrayBuffer(8);

        const success = g.vfunc_info.invoke(
            info,
            implimentor,
            new BigUint64Array(inArgs),
            inArgs.length,
            outArgs,
            outArgs.byteLength / 8,
            returnValue,
            error,
        );

        if (!success) {
            if (!error[0]) {
                throw new Error(`Error invoking vfunc ${getName(info)}`);
            }

            throw createGError(error[0]);
        }

        return parseOutArgs(returnValue, outArgs);
    };
}
