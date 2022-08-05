import GObject from "./bindings/gobject/gobject.js";
import * as GType from "./bindings/gtypes.js";
import { toCString } from "./utils.js";

export function setGValue(gvalue, gtype, value, init = false) {
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
    default: {
      if (gtype > GType.G_TYPE_FUNDAMENTAL_MAX) {
        const parent_type = GObject.g_type_parent(gtype);
        return setGValue(gvalue, parent_type, value, false);
      }

      throw new Error(
        `Invalid Type ${
          new Deno.UnsafePointerView(GObject.g_type_name(gtype)).getCString()
        }`,
      );
    }
  }
}
