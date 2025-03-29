import {cast_u64_ptr} from "../base_utils/convert.ts";
import g from "../bindings/mod.ts";
import {errorEnumCache} from "../types/enum.js";
import {objectByInfo} from "./gobject.js";

export function createGError(value: bigint) {
  const GError = getGLibError();

  const error = Object.create(GError.prototype);
  Reflect.defineMetadata("gi:ref", cast_u64_ptr(value), error);

  const ErrorClass = errorEnumCache.get(error.domain);
  if (ErrorClass) Object.setPrototypeOf(error, ErrorClass.prototype);

  return error;
}

// deno-lint-ignore no-explicit-any
export function getGLibError(): any {
  // TODO: error handling
  g.irepository.require(null, "GLib", "2.0", 0, null);

  return objectByInfo(g.irepository.find_by_name(null, "GLib", "Error"));
}
