import { GFieldInfoFlags } from "../bindings/enums.ts";
import g from "../bindings/mod.js";
import { getName } from "../utils/string.ts";
import { boxArgument, unboxArgument } from "./argument.js";

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
    get() {
      if (!(flags & GFieldInfoFlags.READABLE)) {
        throw new Error(`Field ${name} is not readable`);
      }

      const argument = new ArrayBuffer(8);

      g.field_info.get_field(
        fieldInfo,
        Reflect.getOwnMetadata("gi:ref", this),
        argument,
      );

      const value = unboxArgument(
        type,
        argument,
      );

      return value;
    },

    set(value) {
      if (!(flags & GFieldInfoFlags.WRITABLE)) {
        throw new Error(`Field ${name} is not writable`);
      }

      g.field_info.set_field(
        fieldInfo,
        Reflect.getOwnMetadata("gi:ref", this),
        boxArgument(type, value),
      );
    },
  });
}
