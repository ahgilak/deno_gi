import {
  GIDirection,
  GIFunctionInfoFlags,
  GIInfoType,
} from "../bindings/enums.ts";
import g from "../bindings/mod.ts";
import { ExtendedDataView } from "../utils/dataview.js";
import { getName } from "../utils/string.ts";
import { boxArgument, initArgument, unboxArgument } from "./argument.js";
import { createConstructor } from "./callable/constructor.js";
import { createFunction } from "./callable/function.js";
import { createMethod } from "./callable/method.js";
import { createVFunc } from "./callable/vfunc.js";

export function createArg(info) {
  const type = g.arg_info.get_type(info);
  const arrLength = g.type_info.get_array_length(type);
  const isSkip = g.arg_info.is_skip(info);
  const direction = g.arg_info.get_direction(info);
  const transfer = g.arg_info.get_ownership_transfer(info);
  const callerAllocates = g.arg_info.is_caller_allocates(info);
  const isReturn = g.arg_info.is_return_value(info);
  return { type, arrLength, isSkip, direction, transfer, callerAllocates, isReturn };
}

export function parseCallableArgs(info) {
  const nArgs = g.callable_info.get_n_args(info);
  //const returnType = g.callable_info.get_return_type(info);

  const argDetails = [];
  for (let i = 0; i < nArgs; i++) {
    const argInfo = g.callable_info.get_arg(info, i);
    const arg = createArg(argInfo);
    argDetails.push(arg);
    g.base_info.unref(argInfo);
  }

  const inArgsDetail = argDetails.filter(
    (arg) => !(arg.direction & GIDirection.OUT),
  );


  const outArgsDetail = argDetails.filter(
    (arg) => arg.direction & GIDirection.OUT,
  );

  const parseInArgs = (...args) => {
    const inArgs = new Array(inArgsDetail.length);

    for (let i = 0; i < inArgsDetail.length; i++) {
      const detail = inArgsDetail[i];
      const value = args.shift();
      const pointer = new ExtendedDataView(boxArgument(detail.type, value))
        .getBigUint64();
      inArgs[i] = pointer;
      if (detail.lengthArg >= 0) {
        inArgs[detail.lengthArg] = value.length || value.byteLength || 0;
      }
    }

    return inArgs;
  };

  const initOutArgs = () => {
    const outArgs = outArgsDetail.map((d) => initArgument(d.type));

    return outArgs;
  };

  const parseOutArgs = (outArgs) => {
    return outArgsDetail.map((d, i) => {
      return unboxArgument(d.type, new BigUint64Array([outArgs[i]]).buffer);
    });
  };

  return [parseInArgs, initOutArgs, parseOutArgs];
}

export function handleCallable(target, info) {
  const name = getName(info);
  const type = g.base_info.get_type(info);

  switch (type) {
    case GIInfoType.FUNCTION: {
      const flags = g.function_info.get_flags(info);

      const isMethod = !!(GIFunctionInfoFlags.IS_METHOD & flags);
      const isConstructor = !!(GIFunctionInfoFlags.IS_CONSTRUCTOR & flags);

      if (isConstructor) {
        const value = createConstructor(info, target.prototype);
        Object.defineProperty(target, name, {
          value,
        });
        return;
      }

      if (isMethod) {
        const value = createMethod(info);
        Object.defineProperty(target.prototype, name, {
          enumerable: true,
          value(...args) {
            return value(Reflect.getOwnMetadata("gi:ref", this), ...args);
          },
        });
        return;
      }

      const value = createFunction(info);
      Object.defineProperty(target, name, {
        value,
      });

      return;
    }

    case GIInfoType.VFUNC: {
      if (Object.hasOwn(target.prototype, name)) {
        return;
      }

      const value = createVFunc(info);
      Object.defineProperty(target.prototype, name, {
        enumerable: true,
        value(...args) {
          return value(
            Reflect.getOwnMetadata("gi:ref", this),
            Reflect.getOwnMetadata("gi:gtype", this.constructor),
            ...args,
          );
        },
      });
      return;
    }
  }
}
