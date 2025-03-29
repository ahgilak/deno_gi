import g from "../../bindings/girepository.ts";
import {unboxArgument} from "../argument.ts";
import {ExtendedDataView} from "../../utils/dataview.js";

/**
 * @param {Deno.PointerValue} info
 * @param {ArrayBuffer} buffer
 * @returns
 */
export function unboxList(info, buffer) {
    const paramType = g.type_info.get_param_type(info, 0);
    const result = [];

    const dataView = new ExtendedDataView(buffer);
    let i = 0;

    while (dataView.getUint8()) {
        result.push(unboxArgument(paramType, buffer, i * 8));
        i++;
    }

    g.base_info.unref(paramType);
    return result;
}
