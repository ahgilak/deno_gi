import g from "../bindings/mod.js";
import handleInfo from "../handleInfo.js";
import { getGLibError } from "../utils/error.ts";
import { getDisplayName } from "../utils/string.ts";

function defineValues(target, info) {
  const nValues = g.enum_info.get_n_values(info);

  for (let i = 0; i < nValues; i++) {
    const valueInfo = g.enum_info.get_value(info, i);
    handleInfo(target, valueInfo);
    g.base_info.unref(valueInfo);
  }
}

export const errorEnumCache = new Map();

export function createError(info, error_domain) {
  const domain = g.quark_from_string(error_domain);

  if (errorEnumCache.has(domain)) return errorEnumCache.get(domain);

  const GError = getGLibError();

  const ObjectClass = class extends GError {
    constructor(props) {
      super({
        ...props,
        domain,
      });
    }

    [Symbol.hasInstance](instance) {
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

export function createEnum(info) {
  const error_domain = g.enum_info.get_error_domain(info);

  if (error_domain) {
    return createError(info, error_domain);
  }

  const result = new Object();

  defineValues(result, info);

  return Object.freeze(result);
}
