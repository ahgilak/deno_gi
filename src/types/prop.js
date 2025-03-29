import {deref_buf} from "../base_utils/convert.ts";
import {GParamFlags} from "../bindings/enums.ts";
import g from "../bindings/mod.js";
import {ExtendedDataView} from "../utils/dataview.js";
import {getName} from "../utils/string.ts";
import {boxArgument, unboxArgument} from "./argument.ts";
import {boxValue, initValue, unboxValue} from "./value.js";

export function handleProp(
    target,
    propInfo,
    paramSpecPointer,
) {
    const cName = g.base_info.get_name(propInfo);
    const name = getName(propInfo);
    if (Object.hasOwn(target.prototype, name)) {
        return;
    }
    const paramSpecBuffer = deref_buf(
        paramSpecPointer,
        32, // paramSpec is 72 bytes, but only need 32 bytes is need in here.
    );

    const flags = g.property_info.get_flags(propInfo);
    const argType = g.property_info.get_type(propInfo);

    const paramSpecStruct = new ExtendedDataView(paramSpecBuffer);
    const boxedType = paramSpecStruct.getBigUint64(24);
    const boxedValue = initValue(boxedType);

    Object.defineProperty(target.prototype, name, {
        enumerable: true,
        get() {
            if (!(flags & GParamFlags.READABLE)) {
                throw new Error(`Property ${name} is not readable`);
            }
            g.object.get_property(
                Reflect.getOwnMetadata("gi:ref", this),
                cName,
                boxedValue,
            );

            const argValue = unboxValue(boxedValue, boxedType);
            const value = unboxArgument(argType, deref_buf(argValue, 8));

            return value;
        },

        set(value) {
            if (!(flags & GParamFlags.WRITABLE)) {
                throw new Error(`Property ${name} is not writable`);
            }

            const argValue = boxArgument(argType, value);
            boxValue(boxedValue, boxedType, argValue);
            g.object.set_property(
                Reflect.getOwnMetadata("gi:ref", this),
                cName,
                boxedValue,
            );
        },
    });
}
