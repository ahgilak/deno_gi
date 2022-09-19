import GObject from "../bindings/gobject/symbols.ts";
import * as GType from "../bindings/gTypes.ts";
import { LocalDataView } from "../utils/dataView.ts";

export function GIArgumentToGValue(
  gValue: BigUint64Array,
  gType: Deno.PointerValue,
  giValue: ArrayBufferLike,
): void {
  const dataView = new LocalDataView(giValue);

  switch (Number(gType)) {
    case GType.G_TYPE_CHAR:
      return GObject.g_value_set_char(gValue, dataView.getInt8());
    case GType.G_TYPE_UCHAR:
      return GObject.g_value_set_uchar(gValue, dataView.getUint8());
    case GType.G_TYPE_BOOLEAN:
      return GObject.g_value_set_boolean(gValue, dataView.getInt32());
    case GType.G_TYPE_INT:
      return GObject.g_value_set_int(gValue, dataView.getInt32());
    case GType.G_TYPE_UINT:
      return GObject.g_value_set_uint(gValue, dataView.getUint32());
    case GType.G_TYPE_LONG:
      return GObject.g_value_set_long(gValue, dataView.getBigInt64());
    case GType.G_TYPE_ULONG:
      return GObject.g_value_set_ulong(gValue, dataView.getBigUint64());
    case GType.G_TYPE_INT64:
      return GObject.g_value_set_int64(gValue, dataView.getBigInt64());
    case GType.G_TYPE_UINT64:
      return GObject.g_value_set_uint64(gValue, dataView.getBigUint64());
    case GType.G_TYPE_ENUM:
      return GObject.g_value_set_enum(gValue, dataView.getInt32());
    case GType.G_TYPE_FLAGS:
      return GObject.g_value_set_flags(gValue, dataView.getInt32());
    case GType.G_TYPE_FLOAT:
      return GObject.g_value_set_float(gValue, dataView.getFloat32());
    case GType.G_TYPE_DOUBLE:
      return GObject.g_value_set_double(gValue, dataView.getFloat64());
    case GType.G_TYPE_STRING:
      return GObject.g_value_set_string(gValue, dataView.getBigUint64());
    case GType.G_TYPE_POINTER:
      return GObject.g_value_set_pointer(gValue, dataView.getBigUint64());
    case GType.G_TYPE_OBJECT:
      return GObject.g_value_set_object(gValue, dataView.getBigUint64());
    case GType.G_TYPE_BOXED:
      return GObject.g_value_set_boxed(gValue, dataView.getBigUint64());

    default: {
      if (gType > GType.G_TYPE_FUNDAMENTAL_MAX) {
        const parentType = GObject.g_type_parent(gType);
        return GIArgumentToGValue(gValue, parentType, giValue);
      }
    }
  }
}

export function GValueToGIArgument(
  gValue: BigUint64Array,
  gType: Deno.PointerValue,
): Deno.PointerValue | number | undefined {
  switch (Number(gType)) {
    case GType.G_TYPE_CHAR:
      return GObject.g_value_get_char(gValue);
    case GType.G_TYPE_UCHAR:
      return GObject.g_value_get_uchar(gValue);
    case GType.G_TYPE_BOOLEAN:
      return GObject.g_value_get_boolean(gValue);
    case GType.G_TYPE_INT:
      return GObject.g_value_get_int(gValue);
    case GType.G_TYPE_UINT:
      return GObject.g_value_get_uint(gValue);
    case GType.G_TYPE_LONG:
      return GObject.g_value_get_long(gValue);
    case GType.G_TYPE_ULONG:
      return GObject.g_value_get_ulong(gValue);
    case GType.G_TYPE_INT64:
      return GObject.g_value_get_int64(gValue);
    case GType.G_TYPE_UINT64:
      return GObject.g_value_get_uint64(gValue);
    case GType.G_TYPE_ENUM:
      return GObject.g_value_get_enum(gValue);
    case GType.G_TYPE_FLAGS:
      return GObject.g_value_get_flags(gValue);
    case GType.G_TYPE_FLOAT:
      return GObject.g_value_get_float(gValue);
    case GType.G_TYPE_DOUBLE:
      return GObject.g_value_get_double(gValue);
    case GType.G_TYPE_STRING:
      return GObject.g_value_get_string(gValue);
    case GType.G_TYPE_POINTER:
      return GObject.g_value_get_pointer(gValue);
    case GType.G_TYPE_OBJECT:
      return GObject.g_value_get_object(gValue);
    case GType.G_TYPE_BOXED:
      return GObject.g_value_get_boxed(gValue);

    default: {
      if (gType > GType.G_TYPE_FUNDAMENTAL_MAX) {
        const parentType = GObject.g_type_parent(gType);
        return GValueToGIArgument(gValue, parentType);
      }
    }
  }
}
