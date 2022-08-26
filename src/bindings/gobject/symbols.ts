import { library } from "../../utils.ts";

const gobject = Deno.dlopen(library("gobject-2.0", 0), {
  g_object_class_find_property: {
    parameters: ["pointer", "buffer"],
    result: "pointer",
  },
  g_object_new_with_properties: {
    parameters: ["pointer", "u32", "buffer", "buffer"],
    result: "pointer",
  },
  g_signal_connect_data: {
    parameters: ["pointer", "buffer", "pointer", "pointer", "pointer", "i32"],
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
    parameters: ["buffer", "pointer"],
    result: "pointer",
  },
  g_value_set_boolean: {
    parameters: ["buffer", "i32"],
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
    parameters: ["buffer", "buffer"],
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
