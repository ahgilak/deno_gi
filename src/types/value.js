import g from "../bindings/mod.js";
import { G_TYPE_FUNDAMENTAL_MAX, GType } from "../bindings/enums.ts";
import { ExtendedDataView } from "../utils/dataview.js";

export function initValue(type) {
  const value = new BigUint64Array(3);
  g.value.init(value, type);
  return value;
}

export function boxValue(
  boxedValue,
  boxedType,
  argValue,
) {
  const dataView = new ExtendedDataView(argValue);

  switch (Number(boxedType)) {
    case GType.CHAR:
      return g.value.set_char(boxedValue, dataView.getInt8());
    case GType.UCHAR:
      return g.value.set_uchar(boxedValue, dataView.getUint8());
    case GType.BOOLEAN:
      return g.value.set_boolean(boxedValue, dataView.getInt32());
    case GType.INT:
      return g.value.set_int(boxedValue, dataView.getInt32());
    case GType.UINT:
      return g.value.set_uint(boxedValue, dataView.getUint32());
    case GType.LONG:
      return g.value.set_long(boxedValue, dataView.getBigInt64());
    case GType.ULONG:
      return g.value.set_ulong(boxedValue, dataView.getBigUint64());
    case GType.INT64:
      return g.value.set_int64(boxedValue, dataView.getBigInt64());
    case GType.UINT64:
      return g.value.set_uint64(boxedValue, dataView.getBigUint64());
    case GType.ENUM:
      return g.value.set_enum(boxedValue, dataView.getInt32());
    case GType.FLAGS:
      return g.value.set_flags(boxedValue, dataView.getInt32());
    case GType.FLOAT:
      return g.value.set_float(boxedValue, dataView.getFloat32());
    case GType.DOUBLE:
      return g.value.set_double(boxedValue, dataView.getFloat64());
    case GType.STRING:
      return g.value.set_string(boxedValue, dataView.getBigUint64());
    case GType.POINTER:
      return g.value.set_pointer(boxedValue, dataView.getBigUint64());
    case GType.OBJECT:
      return g.value.set_object(boxedValue, dataView.getBigUint64());
    case GType.BOXED:
      return g.value.set_boxed(boxedValue, dataView.getBigUint64());

    default: {
      if (boxedType > G_TYPE_FUNDAMENTAL_MAX) {
        const parentType = g.type.parent(boxedType);
        return boxValue(boxedValue, parentType, argValue);
      }
    }
  }
}

export function unboxValue(
  boxedValue,
  boxedType,
) {
  switch (Number(boxedType)) {
    case GType.CHAR:
      return g.value.get_char(boxedValue);
    case GType.UCHAR:
      return g.value.get_uchar(boxedValue);
    case GType.BOOLEAN:
      return g.value.get_boolean(boxedValue);
    case GType.INT:
      return g.value.get_int(boxedValue);
    case GType.UINT:
      return g.value.get_uint(boxedValue);
    case GType.LONG:
      return g.value.get_long(boxedValue);
    case GType.ULONG:
      return g.value.get_ulong(boxedValue);
    case GType.INT64:
      return g.value.get_int64(boxedValue);
    case GType.UINT64:
      return g.value.get_uint64(boxedValue);
    case GType.ENUM:
      return g.value.get_enum(boxedValue);
    case GType.FLAGS:
      return g.value.get_flags(boxedValue);
    case GType.FLOAT:
      return g.value.get_float(boxedValue);
    case GType.DOUBLE:
      return g.value.get_double(boxedValue);
    case GType.STRING:
      return g.value.get_string(boxedValue);
    case GType.POINTER:
      return g.value.get_pointer(boxedValue);
    case GType.OBJECT:
      return g.value.get_object(boxedValue);
    case GType.BOXED:
      return g.value.get_boxed(boxedValue);

    default: {
      if (boxedType > G_TYPE_FUNDAMENTAL_MAX) {
        const parentType = g.type.parent(boxedType);
        return unboxValue(boxedValue, parentType);
      }
    }
  }
}
