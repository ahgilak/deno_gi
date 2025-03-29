import g from "../../bindings/mod.js";
import {cast_u64_ptr} from "../../base_utils/convert.ts";
import {createGError} from "../../utils/error.ts";
import {ExtendedDataView} from "../../utils/dataview.js";
import {parseCallableArgs} from "../callable.ts";

export function createConstructor(info, prototype) {
    const [parseInArgs] = parseCallableArgs(info);

    return (...args) => {
        const inArgs = parseInArgs(...args);

        const error = new BigUint64Array(1);
        const returnValue = new ArrayBuffer(8);

        const success = g.function_info.invoke(
            info,
            inArgs,
            inArgs.byteLength / 8,
            new BigUint64Array(0),
            0,
            returnValue,
            error,
        );

        if (!success) {
            if (!error[0]) {
                throw new Error(`Error invoking constructor ${getName(info)}`);
            }

            throw createGError(error[0]);
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
