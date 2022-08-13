import { library } from "../../utils.js";

const gobject = Deno.dlopen(library("gobject-2.0", 0), {
  g_object_class_find_property: {
    parameters: ["pointer", "pointer"],
    result: "pointer",
  },
  g_object_new_with_properties: {
    parameters: ["pointer", "u32", "pointer", "pointer"],
    result: "pointer",
  },
  g_signal_connect_data: {
    parameters: ["pointer", "pointer", "pointer", "pointer", "pointer", "i32"],
    result: "pointer",
  },
  g_signal_emit_by_name: {
    parameters: ["pointer", "pointer"],
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
  g_type_name: {
    parameters: ["pointer"],
    result: "pointer",
  },
  g_type_parent: {
    parameters: ["pointer"],
    result: "pointer",
  },
  g_value_init: {
    parameters: ["pointer", "pointer"],
    result: "pointer",
  },
  g_value_set_boolean: {
    parameters: ["pointer", "i32"],
    result: "void",
  },
  g_value_set_char: {
    parameters: ["pointer", "i8"],
    result: "void",
  },
  g_value_set_double: {
    parameters: ["pointer", "f64"],
    result: "void",
  },
  g_value_set_enum: {
    parameters: ["pointer", "i32"],
    result: "void",
  },
  g_value_set_flags: {
    parameters: ["pointer", "u32"],
    result: "void",
  },
  g_value_set_float: {
    parameters: ["pointer", "f32"],
    result: "void",
  },
  g_value_set_int: {
    parameters: ["pointer", "i32"],
    result: "void",
  },
  g_value_set_int64: {
    parameters: ["pointer", "i32"],
    result: "void",
  },
  g_value_set_long: {
    parameters: ["pointer", "i64"],
    result: "void",
  },
  g_value_set_object: {
    parameters: ["pointer", "pointer"],
    result: "void",
  },
  g_value_set_pointer: {
    parameters: ["pointer", "pointer"],
    result: "void",
  },
  g_value_set_string: {
    parameters: ["pointer", "pointer"],
    result: "void",
  },
  g_value_set_uchar: {
    parameters: ["pointer", "u8"],
    result: "void",
  },
  g_value_set_uint: {
    parameters: ["pointer", "u32"],
    result: "void",
  },
  g_value_set_uint64: {
    parameters: ["pointer", "u32"],
    result: "void",
  },
  g_value_set_ulong: {
    parameters: ["pointer", "pointer"],
    result: "void",
  },
});

export default gobject.symbols;
