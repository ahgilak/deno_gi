import { cast_u64_ptr } from "../base_utils/convert.ts";
import g from "../bindings/mod.js";
import { createStruct } from "../types/struct.js";
import { ExtendedDataView } from "./dataview.js";

export function createGError(errorBuffer: ArrayBuffer) {
  const dataView = new ExtendedDataView(errorBuffer);
  const pointer = cast_u64_ptr(dataView.getBigUint64());

  return new ErrorStruct(pointer);
}

function createErrorStruct() {
  const errorInfo = g.irepository.find_by_name(null, "GLib", "Error");
  const errorGtype = g.registered_type_info.get_g_type(errorInfo);

  const ErrorStruct = createStruct(errorInfo, errorGtype);

  return ErrorStruct;
}

// make sure GLib is loaded
g.irepository.require(null, "GLib", "2.0", 0, null);

const ErrorStruct = createErrorStruct();
