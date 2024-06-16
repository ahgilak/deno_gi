import { cast_ptr_u64, deref_buf } from "../base_utils/convert.ts";
import {
  GIDirection,
  GIFunctionInfoFlags,
  GIInfoType,
  GITypeTag,
} from "../bindings/enums.js";
import g from "../bindings/mod.js";
import { ExtendedDataView } from "../utils/dataview.js";
import { getName } from "../utils/string.ts";
import {
  boxArgument,
  initArguments,
  isTypedArray,
  unboxArgument,
} from "./argument.js";
import { createConstructor } from "./callable/constructor.js";
import { createFunction } from "./callable/function.js";
import { createMethod } from "./callable/method.js";
import { createVFunc } from "./callable/vfunc.js";
import { createCallback } from "./callback.js";

export function createArg(info, index) {
  let nPointers = 0;
  const type = g.arg_info.get_type(info);
  const name = g.base_info.get_name(info);
  const arrLength = g.type_info.get_array_length(type);
  const isSkip = g.arg_info.is_skip(info);
  const direction = g.arg_info.get_direction(info);
  const transfer = g.arg_info.get_ownership_transfer(info);
  const callerAllocates = g.arg_info.is_caller_allocates(info);
  const isReturn = g.arg_info.is_return_value(info);

  if (direction === GIDirection.OUT) nPointers++;
  if (g.type_info.is_pointer(type)) nPointers++;

  return {
    index,
    type,
    name,
    arrLength,
    isSkip,
    direction,
    transfer,
    callerAllocates,
    isReturn,
    nPointers,
  };
}

export function parseCallableArgs(info, has_caller = false) {
  const nArgs = g.callable_info.get_n_args(info);
  const returnType = g.callable_info.get_return_type(info);
  const returnArrLength = g.type_info.get_array_length(returnType);

  const argDetails = [];
  for (let i = 0; i < nArgs; i++) {
    const argInfo = g.callable_info.get_arg(info, i);
    const arg = createArg(argInfo, i);
    argDetails.push(arg);
    g.base_info.unref(argInfo);
  }

  // ignored arguments
  for (const arg of argDetails) {
    arg.ignore = arg.isSkip ||
      // the length arguments will be set automatically
      argDetails.some((detail) => detail.arrLength === arg.index) ||
      returnArrLength === arg.index;
  }

  const inArgsDetail = argDetails.filter(
    (arg) => !(arg.direction == GIDirection.OUT),
  );

  const outArgsDetail = argDetails.filter(
    (arg) => !(arg.direction == GIDirection.IN),
  );

  const parseInArgs = (...args) => {
    const caller_offset = has_caller ? 1 : 0;
    const buffer = new ArrayBuffer((caller_offset + inArgsDetail.length) * 8);
    const argValues = new Map();

    if (has_caller) {
      const view = new ExtendedDataView(buffer);
      const caller = cast_ptr_u64(args.shift());
      view.setBigUint64(caller);
    }

    for (let i = 0; i < inArgsDetail.length; i++) {
      try {
        const offset = (caller_offset + i) * 8;
        const detail = inArgsDetail[i];
        if (detail.ignore) continue;

        // check if this argument contains the length of an arrya
        const array = inArgsDetail.find((arg) =>
          arg.index === detail.arrLength
        );

        if (array) {
          // set this value to the length of the array
          const value = argValues.get(array.type);
          let length;

          // get the length of the array
          if (isTypedArray(value)) {
            length = value.byteLength / value.BYTES_PER_ELEMENT;
          } else if (Array.isArray(value)) {
            length = value.length;
          } else {
            // undefined behavior
            // TODO: what if the length parameter is defined before the array?
            length = 0;
          }

          boxArgument(detail.type, length, buffer, offset);
        } else {
          const value = args.shift();
          argValues.set(detail.type, value);
          boxArgument(detail.type, value, buffer, offset);
        }
      } catch (error) {
        if (error instanceof RangeError) {
          error.message = `Argument ${detail.name}: ${error.message}`;
        }

        throw error;
      }
    }

    argValues.clear();

    return buffer;
  };

  const initOutArgs = () => {
    return initArguments(...outArgsDetail.map((d) => [d.type, d.nPointers]));
  };

  const parseOutArgs = (retValue, outArgs) => {
    // cache all arguments so that we can access them by type
    const argValues = new Map();
    argValues.set(returnType, [0, retValue]);
    for (let i = 0; i < outArgsDetail.length; i++) {
      const arg = outArgsDetail[i];
      argValues.set(arg.type, [i, outArgs]);
    }

    const results = [];

    const unbox = (type, buffer, offset, nPointers, arrLengthIndex) => {
      // if this argument is an array, we need to get it's length
      if (g.type_info.get_tag(type) === GITypeTag.ARRAY) {
        let arrLength = -1;
        const lengthDetail = argDetails.find((a) => a.index === arrLengthIndex);
        const lengthArg = argValues.get(lengthDetail?.type);
        if (lengthArg) {
          const [index, buffer] = lengthArg;
          arrLength = unboxArgument(
            lengthDetail.type,
            buffer,
            index * 8,
            lengthDetail.nPointers,
          );
        }

        results.push(unboxArgument(type, buffer, offset, nPointers, arrLength));
      } else {
        results.push(unboxArgument(type, buffer, offset, nPointers));
      }
    };

    // handle the return value if it's not void
    if (g.type_info.get_tag(returnType) !== GITypeTag.VOID) {
      unbox(returnType, retValue, 0, 0, returnArrLength);
    }

    // handle the rest of the out arguments
    for (let i = 0; i < outArgsDetail.length; i++) {
      const d = outArgsDetail[i];
      if (d.ignore) continue;

      unbox(d.type, outArgs, i * 8, d.nPointers, d.arrLength);
    }

    argValues.clear();

    if (results.length === 1) {
      return results[0];
    } else {
      return results;
    }
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
      const value = createVFunc(info);
      Object.defineProperty(target.prototype, name, {
        enumerable: true,
        get() {
          return (...args) => {
            return value(
              Reflect.getOwnMetadata("gi:ref", this),
              Reflect.getOwnMetadata("gi:gtype", this.constructor),
              ...args,
            );
          };
        },
        set(value) {
          const cName = g.base_info.get_name(info);

          const containerInfo = g.base_info.get_container(info);
          const containerType = g.base_info.get_type(containerInfo);

          let containerStruct, pointer;

          if (containerType === GIInfoType.INTERFACE) {
            // we are setting a vfunc provided by an interface
            containerStruct = g.interface_info.get_iface_struct(containerInfo);
            const klass = g.type_class.ref(
              Reflect.getOwnMetadata("gi:gtype", this.constructor),
            );
            // get the pointer to the interface struct of this class
            pointer = g.type_interface.peek(
              klass,
              g.registered_type_info.get_g_type(containerInfo),
            );
          } else {
            // we are directly setting a vfunc provided by a class
            containerStruct = g.object_info.get_class_struct(containerInfo);
            pointer = g.type_class.ref(
              Reflect.getOwnMetadata("gi:gtype", this.constructor),
            );
          }

          const fieldInfo = g.struct_info.find_field(containerStruct, cName);

          if (!fieldInfo) {
            // This vfunc doesn't have a corresponding field in the class or
            // interface struct
            return;
          }

          const cb = createCallback(info, value, this);
          const offset = g.field_info.get_offset(fieldInfo);
          const dataView = new ExtendedDataView(
            deref_buf(
              pointer,
              offset + 8,
              offset,
            ),
          );
          dataView.setBigUint64(cast_ptr_u64(cb.pointer));
        },
      });
      return;
    }
  }
}

/**
 * Handles a callable method for a class class
 * e.g: GtkWidgetClass is the class struct for GtkWidget and contains static
 * methods
 */
export function handleStructCallable(target, info) {
  const name = getName(info);

  if (Object.hasOwn(target.prototype, name)) return;

  const flags = g.function_info.get_flags(info);

  const isMethod = !!(GIFunctionInfoFlags.IS_METHOD & flags);

  if (isMethod) {
    const value = createMethod(info);
    Object.defineProperty(target, name, {
      enumerable: true,
      value(...args) {
        const klass = g.type_class.ref(
          Reflect.getOwnMetadata("gi:gtype", this),
        );

        return value(klass, ...args);
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
