// deno-lint-ignore-file no-explicit-any

import GIRepository from "../bindings/gobject-introspection/symbols.ts";
import {
  GIDirection,
  GITypeTag,
} from "../bindings/gobject-introspection/enums.ts";
import { GIArgumentToJS, GIArrayToJS, JSToGIArgument } from "./argument.ts";

function shouldSkipReturn(
  info: Deno.PointerValue,
  returnType: Deno.PointerValue,
) {
  return GIRepository.g_callable_info_skip_return(info) ||
    GIRepository.g_type_info_get_tag(returnType) ===
      GITypeTag.GI_TYPE_TAG_VOID;
}

function isDirectionOut(direction: number) {
  return (direction == GIDirection.GI_DIRECTION_OUT ||
    direction === GIDirection.GI_DIRECTION_INOUT);
}

function isDirectionIn(direction: number) {
  return (direction == GIDirection.GI_DIRECTION_IN ||
    direction === GIDirection.GI_DIRECTION_INOUT);
}

function prepareCallable({
  info,
  invoke,
  success,
}: {
  info: Deno.PointerValue;
  invoke: (
    inArgs: bigint[],
    outArgs: bigint[],
    returnValue: BigUint64Array,
    error: BigUint64Array,
  ) => number;
  success: (returnType: Deno.PointerValue, returnValue: ArrayBufferLike) => any;
}) {
  const nArgs = GIRepository.g_callable_info_get_n_args(info);
  const returnType = GIRepository.g_callable_info_get_return_type(info);

  return function (...args: any[]) {
    const argsData = new Array(nArgs);

    for (let i = 0; i < nArgs; i++) {
      const argInfo = GIRepository.g_callable_info_get_arg(info, i);

      argsData[i] = {
        position: i,
        type: GIRepository.g_arg_info_get_type(argInfo),
        direction: GIRepository.g_arg_info_get_direction(argInfo),
        skip: false,
      };

      GIRepository.g_base_info_unref(argInfo);
    }

    for (let i = 0; i < nArgs; i++) {
      const lengthArg = GIRepository.g_type_info_get_array_length(
        argsData[i].type,
      );

      if (lengthArg >= 0) {
        argsData[i].lengthArg = lengthArg;
        argsData[lengthArg].skip = true;
      }
    }

    const inArgsData = argsData.filter((arg) => isDirectionIn(arg.direction));
    const outArgsData = argsData.filter((arg) => isDirectionOut(arg.direction));

    const outArgs = outArgsData.map(() =>
      BigInt(Deno.UnsafePointer.of(new BigUint64Array(1)))
    );

    const inArgs = new Array(inArgsData.length);

    inArgsData.forEach((data, i) => {
      if (data.skip) {
        return;
      }
      const arg = new BigUint64Array(JSToGIArgument(data.type, args[i])).at(0);
      inArgs[i] = arg;

      if (data.lengthArg >= 0) {
        inArgs[data.lengthArg] = BigInt(
          args[i]?.byteLength || args[i]?.length || 0,
        );
      }
    });

    const error = new BigUint64Array(2);
    const returnValue = new BigUint64Array(1);

    const isSucceed = invoke(
      inArgs,
      outArgs,
      returnValue,
      error,
    );

    const retVal = success(returnType, returnValue.buffer);

    if (outArgs.length > 0) {
      const result = [];

      outArgsData.forEach((data, i) => {
        if (data.skip) {
          return;
        }

        const value = Deno.UnsafePointerView.getArrayBuffer(outArgs.at(i)!, 8);

        if (data.lengthArg >= 0) {
          result.push(GIArrayToJS(
            data.type,
            value,
            new Deno.UnsafePointerView(
              outArgs[
                outArgsData.findIndex((arg) => arg.position === data.lengthArg)
              ],
            ).getInt32(),
          ));
        } else {
          result.push(GIArgumentToJS(
            data.type,
            value,
          ));
        }
      });

      if (!shouldSkipReturn(info, returnType)) {
        result.unshift(retVal);
      }

      return result;
    }

    if (!shouldSkipReturn(info, returnType)) {
      return retVal;
    }
  };
}

export function createFunction(info: Deno.PointerValue) {
  return prepareCallable({
    info,
    invoke: (
      inArgs,
      outArgs,
      returnValue,
      error,
    ) =>
      GIRepository.g_function_info_invoke(
        info,
        new BigUint64Array(inArgs),
        inArgs.length,
        new BigUint64Array(outArgs),
        outArgs.length,
        returnValue,
        error,
      ),
    success: GIArgumentToJS,
  });
}

export function createConstructor(
  info: Deno.PointerValue,
  objectClass: any,
) {
  return prepareCallable({
    info,
    invoke: (
      inArgs,
      outArgs,
      returnValue,
      error,
    ) =>
      GIRepository.g_function_info_invoke(
        info,
        new BigUint64Array(inArgs),
        inArgs.length,
        new BigUint64Array(outArgs),
        outArgs.length,
        returnValue,
        error,
      ),
    success: (_returnType, returnValue) =>
      Object.create(
        objectClass.prototype,
        { __ref__: { value: new BigUint64Array(returnValue).at(0) } },
      ),
  });
}

export function createMethod(info: Deno.PointerValue, selfRef: bigint) {
  return prepareCallable({
    info,
    invoke: (
      inArgs,
      outArgs,
      returnValue,
      error,
    ) =>
      GIRepository.g_function_info_invoke(
        info,
        new BigUint64Array([selfRef, ...inArgs]),
        inArgs.length + 1,
        new BigUint64Array(outArgs),
        outArgs.length,
        returnValue,
        error,
      ),
    success: GIArgumentToJS,
  });
}

export function createVFunc(
  info: Deno.PointerValue,
  selfRef: bigint,
  implementor: Deno.PointerValue,
) {
  return prepareCallable({
    info,
    invoke: (
      inArgs,
      outArgs,
      returnValue,
      error,
    ) =>
      GIRepository.g_vfunc_info_invoke(
        info,
        implementor,
        new BigUint64Array([selfRef, ...inArgs]),
        inArgs.length + 1,
        new BigUint64Array(outArgs),
        outArgs.length,
        returnValue,
        error,
      ),
    success: GIArgumentToJS,
  });
}
