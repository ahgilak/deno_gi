import g from "../bindings/mod.ts";
import {GITypeTag} from "../bindings/enums.ts";
import {boxArgument, initArguments, unboxArgument} from "./argument.ts";
import {createArg} from "./callable.ts";
import {cast_ptr_u64} from "../base_utils/convert.ts";
import {ExtendedDataView} from "https://raw.githubusercontent.com/ahgilak/deno_gi/main/src/utils/dataview.js";
import {CbHandler} from "../overrides/GObject.ts";

const nativeTypes: Record<number, string> = {
  [GITypeTag.BOOLEAN]: "i32",
  [GITypeTag.UINT8]: "u8",
  [GITypeTag.INT8]: "i8",
  [GITypeTag.UINT16]: "u16",
  [GITypeTag.INT16]: "i16",
  [GITypeTag.UINT32]: "u32",
  [GITypeTag.INT32]: "i32",
  [GITypeTag.UINT64]: "u64",
  [GITypeTag.INT64]: "i64",
  [GITypeTag.FLOAT]: "f32",
  [GITypeTag.DOUBLE]: "f64",
  [GITypeTag.VOID]: "void",
};

function ffiType(tag: number) {
  return nativeTypes[tag] || "pointer";
}

function parseArgs(
  info: Deno.PointerValue,
  args: Deno.PointerValue[],
) {
  return args.map((value, i) => {
    const argInfo = g.callable_info.get_arg(info, i);
    const argType = g.arg_info.get_type(argInfo);
    const tag = g.type_info.get_tag(argType);

    const buffer = initArguments(argType);
    const view = new ExtendedDataView(buffer);
    view.setBigUint64(cast_ptr_u64(value));

    if (argType === null) throw new TypeError("argType is null");

    const result = nativeTypes[tag] ? value : unboxArgument(argType, buffer, undefined);

    g.base_info.unref(argInfo);
    g.base_info.unref(argType);
    return result;
  });
}

export function createCallback(
  info: Deno.PointerValue,
  callback: CbHandler,
  caller?: unknown,
) {
  const nArgs = g.callable_info.get_n_args(info);
  const parameters = caller ? ["pointer"] : [];
  const returnType = g.callable_info.get_return_type(info);

  if (returnType === null) throw new TypeError("returnType is null");

  for (let i = 0; i < nArgs; i++) {
    const argInfo = g.callable_info.get_arg(info, i);
    const { type: argType } = createArg(argInfo);
    const tag = g.type_info.get_tag(argType);
    if (tag != GITypeTag.VOID) {
      parameters.push(ffiType(tag));
    }

    g.base_info.unref(argType);
    g.base_info.unref(argInfo);
  }

  // @todo safely cast string to Deno.NativeType
  return new Deno.UnsafeCallback(
    {
      parameters: parameters as Deno.NativeType[],
      result: ffiType(g.type_info.get_tag(returnType)) as Deno.NativeResultType,
    },
    caller
      ? (_, ...args) => boxArgument(returnType, callback(caller, ...parseArgs(info, args as Deno.PointerValue[])))
      : (...args) => boxArgument(returnType, callback(...parseArgs(info, args as Deno.PointerValue[]))),
  );
}
