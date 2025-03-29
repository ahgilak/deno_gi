import g from "../bindings/mod.js";
import {cast_buf_ptr} from "../base_utils/convert.ts";
import {getDisplayName} from "../utils/string.ts";
import {handleCallable} from "./callable.ts";
import {handleField} from "./field.js";

function defineMethods(target, info) {
    const nMethods = g.struct_info.get_n_methods(info);

    for (let i = 0; i < nMethods; i++) {
        const methodInfo = g.struct_info.get_method(info, i);
        handleCallable(target, methodInfo);
    }
}

function defineFields(target, info) {
    const nFields = g.struct_info.get_n_fields(info);

    for (let i = 0; i < nFields; i++) {
        const fieldInfo = g.struct_info.get_field(info, i);
        handleField(target, fieldInfo);
    }
}

export function createStruct(info, gType) {
    const size = g.struct_info.get_size(info);

    const ObjectClass = class {
        constructor() {
            Reflect.defineMetadata(
                "gi:ref",
                cast_buf_ptr(new ArrayBuffer(size)),
                this,
            );
        }
    };

    Object.defineProperty(ObjectClass, "name", {
        value: getDisplayName(info),
    });

    Reflect.defineMetadata("gi:gtype", gType, ObjectClass);

    defineMethods(ObjectClass, info);
    defineFields(ObjectClass, info);

    return ObjectClass;
}
