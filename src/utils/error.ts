import { cast_u64_ptr } from "../base_utils/convert.ts";
import { require } from "../gi.js";

export function createGError(pointer: bigint) {
  const GError = getGLibError();

  const error = Object.create(GError.prototype);
  Reflect.defineMetadata("gi:ref", cast_u64_ptr(pointer), error);

  error.stack = new Error().stack;

  return error;
}

export function getGLibError() {
  return require("GLib", "2.0").Error;
}
