import GObject from "./bindings/gobject/symbols.ts";
import * as GType from "./bindings/gtypes.ts";
import { convertArrayType } from "./prepare.ts";
import { toCString } from "./utils.ts";

export function setGValue(
  gvalue: BigUint64Array,
  gtype: Deno.PointerValue,
  // deno-lint-ignore no-explicit-any
  value: any,
  init = false,
): void {
  if (init) {
    GObject.g_value_init(gvalue, gtype);
  }

  switch (Number(gtype)) {
    case GType.G_TYPE_CHAR:
      return GObject.g_value_set_char(gvalue, value.charCodeAt(0));
    case GType.G_TYPE_UCHAR:
      return GObject.g_value_set_uchar(gvalue, value.charCodeAt(0));
    case GType.G_TYPE_BOOLEAN:
      return GObject.g_value_set_boolean(gvalue, Number(value));
    case GType.G_TYPE_INT:
      return GObject.g_value_set_int(gvalue, Number(value));
    case GType.G_TYPE_UINT:
      return GObject.g_value_set_uint(gvalue, Number(value));
    case GType.G_TYPE_LONG:
      return GObject.g_value_set_long(gvalue, BigInt(value));
    case GType.G_TYPE_ULONG:
      return GObject.g_value_set_ulong(gvalue, BigInt(value));
    case GType.G_TYPE_INT64:
      return GObject.g_value_set_int64(gvalue, BigInt(value));
    case GType.G_TYPE_UINT64:
      return GObject.g_value_set_uint64(gvalue, BigInt(value));
    case GType.G_TYPE_ENUM:
      return GObject.g_value_set_enum(gvalue, Number(value));
    case GType.G_TYPE_FLAGS:
      return GObject.g_value_set_flags(gvalue, Number(value));
    case GType.G_TYPE_FLOAT:
      return GObject.g_value_set_float(gvalue, Number(value));
    case GType.G_TYPE_DOUBLE:
      return GObject.g_value_set_double(gvalue, Number(value));
    case GType.G_TYPE_STRING:
      return GObject.g_value_set_string(gvalue, toCString(value));
    case GType.G_TYPE_POINTER:
      return GObject.g_value_set_pointer(gvalue, Deno.UnsafePointer.of(value));
    case GType.G_TYPE_OBJECT:
      return GObject.g_value_set_object(gvalue, value.__ref__);
    case GType.G_TYPE_BOXED:
      return GObject.g_value_set_boxed(gvalue, Deno.UnsafePointer.of(convertArrayType(value)!));
    
    default: {
      if (gtype > GType.G_TYPE_FUNDAMENTAL_MAX) {
        const parentType = GObject.g_type_parent(gtype);
        return setGValue(gvalue, parentType, value, false);
      }

      throw new Error("Invalid Type " + gtype + " " + GType.G_TYPE_BOXED);
    }
  }
}
