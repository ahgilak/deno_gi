import { getLibraryName } from "../../utils/library.ts";

const gobject = Deno.dlopen(getLibraryName("gobject-2.0", 0), {
  g_object_class_find_property: {
    parameters: ["pointer", "pointer"],
    result: "pointer",
  },
  g_object_get_property: {
    parameters: ["pointer", "pointer", "buffer"],
    result: "pointer",
  },
  g_value_get_type: {
    parameters: [],
    result: "usize",
  },
  g_object_interface_find_property: {
    parameters: ["pointer", "pointer"],
    result: "pointer",
  },
  g_object_new: {
    parameters: ["pointer", "pointer"],
    result: "pointer",
  },
  g_object_set_property: {
    parameters: ["pointer", "pointer", "buffer"],
    result: "void",
  },
  g_signal_connect_data: {
    parameters: ["pointer", "buffer", "pointer", "pointer", "pointer", "i32"],
    result: "pointer",
  },
  g_signal_emit_by_name: {
    parameters: ["pointer", "buffer"],
    result: "void",
  },
  g_signal_handler_disconnect: {
    parameters: ["pointer", "pointer"],
    result: "void",
  },
  g_type_class_ref: {
    parameters: ["pointer"],
    result: "pointer",
  },
  g_type_default_interface_ref: {
    parameters: ["pointer"],
    result: "pointer",
  },
  g_type_name: {
    parameters: ["pointer"],
    result: "pointer",
  },
  g_type_parent: {
    parameters: ["pointer"],
    result: "pointer",
  },
  g_value_get_boolean: {
    parameters: ["buffer"],
    result: "i32",
  },
  g_value_get_boxed: {
    parameters: ["buffer"],
    result: "pointer",
  },
  g_value_get_char: {
    parameters: ["buffer"],
    result: "i8",
  },
  g_value_get_double: {
    parameters: ["buffer"],
    result: "f64",
  },
  g_value_get_enum: {
    parameters: ["buffer"],
    result: "i32",
  },
  g_value_get_flags: {
    parameters: ["buffer"],
    result: "u32",
  },
  g_value_get_float: {
    parameters: ["buffer"],
    result: "f32",
  },
  g_value_get_int: {
    parameters: ["buffer"],
    result: "i32",
  },
  g_value_get_int64: {
    parameters: ["buffer"],
    result: "i64",
  },
  g_value_get_long: {
    parameters: ["buffer"],
    result: "i64",
  },
  g_value_get_object: {
    parameters: ["buffer"],
    result: "buffer",
  },
  g_value_get_pointer: {
    parameters: ["buffer"],
    result: "pointer",
  },
  g_value_get_string: {
    parameters: ["buffer"],
    result: "buffer",
  },
  g_value_get_uchar: {
    parameters: ["buffer"],
    result: "u8",
  },
  g_value_get_uint: {
    parameters: ["buffer"],
    result: "u32",
  },
  g_value_get_uint64: {
    parameters: ["buffer"],
    result: "u64",
  },
  g_value_get_ulong: {
    parameters: ["buffer"],
    result: "pointer",
  },
  g_value_init: {
    parameters: ["buffer", "pointer"],
    result: "pointer",
  },
  g_value_set_boolean: {
    parameters: ["buffer", "i32"],
    result: "void",
  },
  g_value_set_boxed: {
    parameters: ["buffer", "pointer"],
    result: "void",
  },
  g_value_set_char: {
    parameters: ["buffer", "i8"],
    result: "void",
  },
  g_value_set_double: {
    parameters: ["buffer", "f64"],
    result: "void",
  },
  g_value_set_enum: {
    parameters: ["buffer", "i32"],
    result: "void",
  },
  g_value_set_flags: {
    parameters: ["buffer", "u32"],
    result: "void",
  },
  g_value_set_float: {
    parameters: ["buffer", "f32"],
    result: "void",
  },
  g_value_set_int: {
    parameters: ["buffer", "i32"],
    result: "void",
  },
  g_value_set_int64: {
    parameters: ["buffer", "i64"],
    result: "void",
  },
  g_value_set_long: {
    parameters: ["buffer", "i64"],
    result: "void",
  },
  g_value_set_object: {
    parameters: ["buffer", "pointer"],
    result: "void",
  },
  g_value_set_pointer: {
    parameters: ["buffer", "pointer"],
    result: "void",
  },
  g_value_set_string: {
    parameters: ["buffer", "pointer"],
    result: "void",
  },
  g_value_set_uchar: {
    parameters: ["buffer", "u8"],
    result: "void",
  },
  g_value_set_uint: {
    parameters: ["buffer", "u32"],
    result: "void",
  },
  g_value_set_uint64: {
    parameters: ["buffer", "u64"],
    result: "void",
  },
  g_value_set_ulong: {
    parameters: ["buffer", "pointer"],
    result: "void",
  },
});

export default gobject.symbols;
