import {cast_ptr_u64, deref_buf} from "../base_utils/convert.ts";
import {GIDirection, GIFunctionInfoFlags, GIInfoType, GITypeTag} from "../bindings/enums.ts";
import g from "../bindings/mod.ts";
import {ExtendedDataView} from "../utils/dataview.js";
import {getName} from "../utils/string.ts";
import {boxArgument, initArguments, isTypedArray, unboxArgument} from "./argument.ts";
import {createConstructor} from "./callable/constructor.js";
import {createFunction} from "./callable/function.js";
import {createMethod} from "./callable/method.js";
import {createVFunc} from "./callable/vfunc.js";
import {createCallback} from "./callback.ts";

export type ArgMetadata = {
  type: Deno.PointerValue;
  nPointers: number;
  name: string | null;
  arrLength: number;
  isSkip: boolean;
  direction: GIDirection;
  transfer: number;
  callerAllocates: boolean;
  isReturn: boolean;
  ignore: boolean;
  index: number | null;
};

/**
 * Converts a GObject Introspection argument information pointer into a TypeScript object representation with detailed
 * metadata about the argument.
 * @param info Pointer to the GObject Introspection argument information.
 */
export function createArg(
  info: Deno.PointerValue,
): ArgMetadata {
  let nPointers = 0;

  const type = g.arg_info.get_type(info);

  const metadata = {
    name: g.base_info.get_name(info),
    arrLength: g.type_info.get_array_length(type),
    isSkip: g.arg_info.is_skip(info),
    direction: g.arg_info.get_direction(info),
    transfer: g.arg_info.get_ownership_transfer(info),
    callerAllocates: g.arg_info.is_caller_allocates(info),
    isReturn: g.arg_info.is_return_value(info),
  };

  if (metadata.direction === GIDirection.OUT) nPointers++;
  if (g.type_info.is_pointer(type)) nPointers++;

  return {
    type,
    nPointers,
    ...metadata,
    ignore: false,
    index: null,
  };
}

export function parseCallableArgs(
  info: Deno.PointerValue,
  has_caller = false,
) {
  const nArgs = g.callable_info.get_n_args(info);
  const returnType = g.callable_info.get_return_type(info);
  const returnArrLength = g.type_info.get_array_length(returnType);

  const argDetails: ArgMetadata[] = [];
  for (let i = 0; i < nArgs; i++) {
    const argInfo = g.callable_info.get_arg(info, i);
    const arg = createArg(argInfo);
    argDetails.push(arg);
    g.base_info.unref(argInfo);
  }

  // ignored arguments
  // the length arguments will be set automatically
  for (const arg of argDetails) {
    arg.ignore = arg.isSkip ||
      argDetails.some((detail) => detail.arrLength === arg.index) ||
      returnArrLength === arg.index;
  }

  const inArgsDetail = argDetails.filter(
    (arg) => !(arg.direction === GIDirection.OUT),
  );

  const usedInArgDetail = inArgsDetail.filter((arg) => !arg.ignore);

  const outArgsDetail = argDetails.filter(
    (arg) => !(arg.direction === GIDirection.IN),
  );

  const parseInArgs = (...args: Deno.PointerValue[]) => {
    const caller_offset = has_caller ? 1 : 0;
    const buffer = new ArrayBuffer((caller_offset + inArgsDetail.length) * 8);

    const argValues = new Map();
    for (let i = 0; i < usedInArgDetail.length; i++) {
      const arg = usedInArgDetail[i];
      argValues.set(arg.type, args[i]);
    }

    if (has_caller) {
      const view = new ExtendedDataView(buffer);
      const ptr = args.shift();
      if (!ptr) throw new TypeError("pointer is nullish");
      const caller = cast_ptr_u64(ptr);
      view.setBigUint64(caller);
    }

    for (let i = 0; i < inArgsDetail.length; i++) {
      const offset = (caller_offset + i) * 8;
      const detail = inArgsDetail[i];
      if (detail.isSkip) continue;

      try {
        // check if this argument contains the length of an arrya
        const array = inArgsDetail.find((arg) => arg.arrLength === detail.index);

        if (array) {
          // set this value to the length of the array
          const value = argValues.get(array.type);
          let length;

          // get the length of the array
          if (typeof value === "string") {
            length = value.length;
          } else if (isTypedArray(value)) {
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
        if (error instanceof Error) {
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

  const parseOutArgs = (retValue: unknown, outArgs: unknown) => {
    // cache all arguments so that we can access them by type
    const argValues = new Map();
    argValues.set(returnType, [0, retValue]);
    for (let i = 0; i < outArgsDetail.length; i++) {
      const arg = outArgsDetail[i];
      argValues.set(arg.type, [i, outArgs]);
    }

    const results = [];

    const unbox = (
      type: Deno.PointerObject<unknown>,
      buffer: unknown,
      offset: number | undefined,
      nPointers: number | undefined,
      arrLengthIndex: any,
    ) => {
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

export function handleCallable(
  target: { prototype: unknown },
  info: Deno.PointerValue,
) {
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
          value(...args: unknown[]) {
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
          return (...args: unknown[]) => {
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
export function handleStructCallable(
  target: { prototype: object },
  info: Deno.PointerValue,
) {
  const name = getName(info);

  if (Object.hasOwn(target.prototype, name)) return;

  const flags = g.function_info.get_flags(info);

  const isMethod = !!(GIFunctionInfoFlags.IS_METHOD & flags);

  if (isMethod) {
    const value = createMethod(info);
    Object.defineProperty(target, name, {
      enumerable: true,
      value(...args: unknown[]) {
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
