import { cast_u64_ptr } from "../base_utils/convert.ts";
import { require } from "../gi.js";
import { ExtendedDataView } from "./dataview.js";

export function createGError(errorBuffer: ArrayBuffer) {
  const GError = getGLibError();

  const dataView = new ExtendedDataView(errorBuffer);
  const pointer = cast_u64_ptr(dataView.getBigUint64());

  const error = Object.create(GError.prototype);
  Reflect.defineMetadata("gi:ref", pointer, error);

  error.stack = new Error().stack;

  return error;
}

export function getGLibError() {
  return require("GLib", "2.0").Error;
}
