import g from "../bindings/mod.ts";
import handleInfo from "../handleInfo.js";
import {getGLibError} from "../utils/error.ts";
import {getDisplayName} from "../utils/string.ts";

/**
 * Extracts enum values from GObject Introspection data and adds them to the target object.
 * Handles proper resource cleanup by unreferencing each value after processing.
 *
 * @param {Object} target - The object on which values will be defined.
 * @param {unknown} info - The information to derive the values from.
 */
function defineValues(target: Record<string, unknown>, info: unknown) {
  const nValues = g.enum_info.get_n_values(info);

  for (let i = 0; i < nValues; i++) {
    const valueInfo = g.enum_info.get_value(info, i);
    handleInfo(target, valueInfo);
    g.base_info.unref(valueInfo);
  }
}

export const errorEnumCache = new Map();

export function createError(info: Deno.PointerValue, error_domain: unknown) {
  const domain = g.quark_from_string(error_domain);

  if (errorEnumCache.has(domain)) return errorEnumCache.get(domain);

  const GError = getGLibError();

  const ObjectClass = class extends GError {
    constructor(props: Record<string, unknown>) {
      super({
        ...props,
        domain,
      });
    }

    [Symbol.hasInstance](instance: { domain: unknown }) {
      return (instance instanceof GError) && (instance.domain === this.domain);
    }
  };

  Object.defineProperty(ObjectClass, "name", {
    value: getDisplayName(info),
  });

  defineValues(ObjectClass, info);

  errorEnumCache.set(domain, ObjectClass);

  return ObjectClass;
}

/**
 * Creates an enum object from GObject Introspection data.
 *
 * @todo provide proper exit type
 * @param info
 */
export function createEnum(info: Deno.PointerValue) {
  const error_domain = g.enum_info.get_error_domain(info);

  if (error_domain) {
    return createError(info, error_domain);
  }

  const result = {};

  defineValues(result, info);

  return Object.freeze(result);
}
