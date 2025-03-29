import {GIInfoType} from "./bindings/enums.ts";
import g from "./bindings/mod.js";
import {handleCallable} from "./types/callable.ts";
import {createConstant} from "./types/constant.ts";
import {createEnum} from "./types/enum.ts";
import {handleSignal} from "./types/signal.js";
import {objectByInfo} from "./utils/gobject.js";
import {getName} from "./utils/string.ts";

export function handleInfo(target, info) {
    const type = g.base_info.get_type(info);
    const name = getName(info);

    switch (type) {
        case GIInfoType.ENUM:
            // create enums directly so that we can lookup GLib.Errors later
            g.base_info.ref(info);
            Object.defineProperty(target, name, {
                value: createEnum(info),
            });
            break;
        case GIInfoType.FLAGS:
        case GIInfoType.OBJECT:
        case GIInfoType.STRUCT:
        case GIInfoType.INTERFACE: {
            g.base_info.ref(info);
            Object.defineProperty(target, name, {
                get() {
                    return objectByInfo(info);
                },
            });
            break;
        }

        case GIInfoType.CONSTANT: {
            Object.defineProperty(target, name, {
                value: createConstant(info),
            });
            break;
        }

        case GIInfoType.VALUE: {
            const value = g.value_info.get_value(info);

            Object.defineProperty(target, name, {
                enumerable: true,
                value: Number(value),
            });
            break;
        }

        case GIInfoType.FUNCTION: {
            handleCallable(target, info);
            break;
        }

        case GIInfoType.SIGNAL: {
            handleSignal(target, info);
            break;
        }

        /*case GIInfoType.CALLBACK:
        handleCallback(target, info);
        break;*/
    }
}

export default handleInfo;
