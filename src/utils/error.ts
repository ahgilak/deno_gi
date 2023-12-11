import { cast_u64_ptr } from "../base_utils/convert.ts";
import { require } from "../gi.js";
import { ExtendedDataView } from "./dataview.js";

export function createGError(errorBuffer: ArrayBuffer) {
  const GError = getGLibError();

  const dataView = new ExtendedDataView(errorBuffer);
  const pointer = cast_u64_ptr(dataView.getBigUint64());

  const error = new GError(pointer);

  return error;
}

export function getGLibError() {
  return require("GLib", "2.0").Error;
}

// function createErrorStruct(pointer: Deno.PointerValue) {

//   const ErrorStruct = createStruct(errorInfo, errorGtype);

//   return new ErrorStruct(pointer);
// }

// // make sure GLib is loaded
// g.irepository.require(null, "GLib", "2.0", 0, null);
