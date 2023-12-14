import g from "../bindings/mod.ts";
import { GITypeTag } from "../bindings/enums.ts";
import { boxArgument, unboxArgument } from "./argument.ts";
import { cast_ptr_u64, ref_buf } from "../base_utils/convert.ts";
import { createArg } from "./callable.ts";

const nativeTypes = new Map(
  [
    [GITypeTag.BOOLEAN, "i32"],
    [GITypeTag.UINT8, "u8"],
    [GITypeTag.INT8, "i8"],
    [GITypeTag.UINT16, "u16"],
    [GITypeTag.INT16, "i16"],
    [GITypeTag.UINT32, "u32"],
    [GITypeTag.INT32, "i32"],
    [GITypeTag.UINT64, "u64"],
    [GITypeTag.INT64, "i64"],
    [GITypeTag.FLOAT, "f32"],
    [GITypeTag.DOUBLE, "f64"],
    [GITypeTag.VOID, "void"],
  ],
);

function ffiType(tag: GITypeTag) {
  return nativeTypes.get(tag) || "pointer";
}

function parseArgs(
  info: Deno.PointerValue,
  args: Deno.PointerValue[],
) {
  return args.map((value, i) => {
    const argInfo = g.callable_info.get_arg(info, i);
    const argType = g.arg_info.get_type(argInfo);
    const tag = g.type_info.get_tag(argType);

    const result = nativeTypes.get(tag)
      ? value
      : unboxArgument(argType, ref_buf(cast_ptr_u64(value)).buffer);

    g.base_info.unref(argInfo);
    g.base_info.unref(argType);
    return result;
  });
}

export function createCallback(
  info: Deno.PointerValue,
  callback: (...args: unknown[]) => unknown,
  caller?: unknown,
) {
  const nArgs = g.callable_info.get_n_args(info);
  const parameters = caller ? ["pointer"] : [];
  const returnType = g.callable_info.get_return_type(info);

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

  return new Deno.UnsafeCallback(
    { parameters: parameters as ["pointer"], result: "buffer" },
    caller
      ? (_, ...args) =>
        boxArgument(returnType, callback(caller, ...parseArgs(info, args)))
      : (...args) =>
        boxArgument(returnType, callback(...parseArgs(info, args))),
  );
}