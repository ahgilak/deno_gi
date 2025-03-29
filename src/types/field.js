import {cast_ptr_u64, deref_buf} from "../base_utils/convert.ts";
import {GFieldInfoFlags, GIInfoType, GITypeTag} from "../bindings/enums.ts";
import g from "../bindings/mod.js";
import {ExtendedDataView} from "../utils/dataview.js";
import {getName} from "../utils/string.ts";
import {boxArgument, initArguments, unboxArgument} from "./argument.ts";
import {createCallback} from "./callback.ts";

export function handleField(
    target,
    fieldInfo,
) {
    const name = getName(fieldInfo);

    if (Object.hasOwn(target.prototype, name)) {
        return;
    }

    const flags = g.field_info.get_flags(fieldInfo);
    const type = g.field_info.get_type(fieldInfo);

    Object.defineProperty(target.prototype, name, {
        enumerable: true,
        configurable: true,
        get() {
            if (!(flags & GFieldInfoFlags.READABLE)) {
                throw new Error(`Field ${name} is not readable`);
            }

            const argument = initArguments(type);

            g.field_info.get_field(
                fieldInfo,
                Reflect.getOwnMetadata("gi:ref", this),
                argument,
            );

            const value = unboxArgument(type, argument);

            return value;
        },

        set(value) {
            if (!(flags & GFieldInfoFlags.WRITABLE)) {
                throw new Error(`Field ${name} is not writable`);
            }

            const tag = g.type_info.get_tag(type);

            switch (tag) {
                case GITypeTag.OBJECT:
                case GITypeTag.STRUCT: {
                    console.warn(`cannot set complex field: ${name}`);
                    break;
                }
                case GITypeTag.INTERFACE: {
                    const info = g.type_info.get_interface(type);
                    switch (g.base_info.get_type(info)) {
                        case GIInfoType.CALLBACK: {
                            // create a callback and set it to the field's pointer
                            const cb = createCallback(info, value);
                            const offset = g.field_info.get_offset(fieldInfo);
                            const dataView = new ExtendedDataView(
                                deref_buf(
                                    Reflect.getOwnMetadata("gi:ref", this),
                                    offset + 8,
                                    offset,
                                ),
                            );
                            dataView.setBigUint64(cast_ptr_u64(cb.pointer));
                            break;
                        }
                        default: {
                            console.warn(`cannot set complex field: ${name}`);
                            break;
                        }
                    }
                    g.base_info.unref(info);
                    break;
                }
                default: {
                    const boxed = boxArgument(type, value);

                    g.field_info.set_field(
                        fieldInfo,
                        Reflect.getOwnMetadata("gi:ref", this),
                        boxed,
                    );
                    break;
                }
            }
        },
    });
}
