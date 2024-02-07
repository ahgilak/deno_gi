import { cast_ptr_u64, deref_buf } from "../base_utils/convert.ts";
import {
  GIDirection,
  GIFunctionInfoFlags,
  GIInfoType,
} from "../bindings/enums.js";
import g from "../bindings/mod.js";
import { ExtendedDataView } from "../utils/dataview.js";
import { getName } from "../utils/string.ts";
import { boxArgument, initArgument, unboxArgument } from "./argument.js";
import { createConstructor } from "./callable/constructor.js";
import { createFunction } from "./callable/function.js";
import { createMethod } from "./callable/method.js";
import { createVFunc } from "./callable/vfunc.js";
import { createCallback } from "./callback.js";

export function createArg(info) {
  const type = g.arg_info.get_type(info);
  const arrLength = g.type_info.get_array_length(type);
  const isSkip = g.arg_info.is_skip(info);
  const direction = g.arg_info.get_direction(info);
  const transfer = g.arg_info.get_ownership_transfer(info);
  const callerAllocates = g.arg_info.is_caller_allocates(info);
  const isReturn = g.arg_info.is_return_value(info);
  return {
    type,
    arrLength,
    isSkip,
    direction,
    transfer,
    callerAllocates,
    isReturn,
  };
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
    return new BigUint64Array(outArgsDetail.map((d) => initArgument(d.type)));
  };

  const parseOutArgs = (outArgs) => {
    return outArgsDetail.map((d, i) => {
      return unboxArgument(d.type, outArgs[i]);
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
