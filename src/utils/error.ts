import { cast_u64_ptr } from "../base_utils/convert.ts";
import g from "../bindings/mod.js";
import { createStruct } from "../types/struct.js";
import { ExtendedDataView } from "./dataview.js";

export function gerrorToString(error: ArrayBuffer) {
  const dataView = new ExtendedDataView(error);
  const pointer = dataView.getBigUint64();

  Reflect.defineMetadata("gi:ref", cast_u64_ptr(pointer), errorStruct);

  const domain = errorStruct.domain;
  const code = errorStruct.code;
  const messageStr = errorStruct.message;

  return `GLib.Error(${domain}, ${code}): ${messageStr}`;
}

g.irepository.require(null, "GLib", "2.0", 0, null);

type ErrorStruct = {
  domain: number;
  code: number;
  message: string;
};

function createErrorStruct() {
  const errorInfo = g.irepository.find_by_name(null, "GLib", "Error");
  const errorGtype = g.registered_type_info.get_g_type(errorInfo);

  const ErrorStruct = createStruct(errorInfo, errorGtype);

  return new ErrorStruct() as ErrorStruct;
}

const errorStruct = createErrorStruct();
