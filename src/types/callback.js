import g from "../bindings/mod.js";
import { GITypeTag } from "../bindings/enums.js";
import { unboxArgument } from "./argument.js";

const nativeTypes = {
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

function ffiType(tag) {
  return nativeTypes[tag] || "pointer";
}

function parseArgs(
  info,
  args,
) {
  return args.map((value, i) => {
    const argInfo = g.callable_info.get_arg(info, i);
    const argType = g.arg_info.get_type(argInfo);
    const tag = g.type_info.get_tag(argType);
    const result = nativeTypes[tag]
      ? value
      : unboxArgument(argType, new BigUint64Array([BigInt(value)]).buffer);

    g.base_info.unref(argInfo);
    g.base_info.unref(argType);
    return result;
  });
}

export function createCallback(
  info,
  callback,
  caller,
) {
  const nArgs = g.callable_info.get_n_args(info);
  const parameters = caller ? ["pointer"] : [];
  const returnType = g.callable_info.get_return_type(info);
  const returnTypeTag = g.type_info.get_tag(returnType);
  const result = ffiType(returnTypeTag);
  g.base_info.unref(returnType);

  for (let i = 0; i < nArgs; i++) {
    const argInfo = g.callable_info.get_arg(info, i);
    const argType = g.arg_info.get_type(argInfo);
    const argTypeTag = g.type_info.get_tag(argType);
    parameters.push(ffiType(argTypeTag));
    g.base_info.unref(argType);
    g.base_info.unref(argInfo);
  }

  return new Deno.UnsafeCallback(
    { parameters, result },
    caller
      ? (_, ...args) => callback(caller, ...parseArgs(info, args))
      : (...args) => callback(...parseArgs(info, args)),
  );
}
