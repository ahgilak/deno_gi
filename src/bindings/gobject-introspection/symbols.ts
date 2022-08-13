import { library } from "../../utils.js";

const girepository = Deno.dlopen(library("girepository-1.0", 1), {
  g_arg_info_get_direction: {
    parameters: ["pointer"],
    result: "i32",
  },
  g_arg_info_get_type: {
    parameters: ["pointer"],
    result: "pointer",
  },
  g_base_info_get_name: {
    parameters: ["pointer"],
    result: "pointer",
  },
  g_base_info_get_type: {
    parameters: ["pointer"],
    result: "i32",
  },
  g_base_info_unref: {
    parameters: ["pointer"],
    result: "void",
  },
  g_callable_info_get_arg: {
    parameters: ["pointer", "i32"],
    result: "pointer",
  },
  g_callable_info_get_n_args: {
    parameters: ["pointer"],
    result: "i32",
  },
  g_callable_info_get_return_type: {
    parameters: ["pointer"],
    result: "pointer",
  },
  g_callable_info_is_method: {
    parameters: ["pointer"],
    result: "i32",
  },
  g_constant_info_get_type: {
    parameters: ["pointer"],
    result: "pointer",
  },
  g_constant_info_get_value: {
    parameters: ["pointer", "pointer"],
    result: "i32",
  },
  g_enum_info_get_n_values: {
    parameters: ["pointer"],
    result: "i32",
  },
  g_enum_info_get_value: {
    parameters: ["pointer", "i32"],
    result: "pointer",
  },
  g_function_info_get_flags: {
    parameters: ["pointer"],
    result: "i32",
  },
  g_function_info_invoke: {
    parameters: [
      "pointer",
      "pointer",
      "i32",
      "pointer",
      "i32",
      "pointer",
      "pointer",
    ],
    result: "i32",
  },
  g_interface_info_get_method: {
    parameters: ["pointer", "i32"],
    result: "pointer",
  },
  g_interface_info_get_n_methods: {
    parameters: ["pointer"],
    result: "i32",
  },
  g_irepository_get_default: {
    parameters: [],
    result: "pointer",
  },
  g_irepository_get_info: {
    parameters: ["pointer", "pointer", "i32"],
    result: "pointer",
  },
  g_irepository_get_n_infos: {
    parameters: ["pointer", "pointer"],
    result: "i32",
  },
  g_irepository_require: {
    parameters: ["pointer", "pointer", "pointer", "i32", "pointer"],
    result: "pointer",
  },
  g_object_info_get_method: {
    parameters: ["pointer", "i32"],
    result: "pointer",
  },
  g_object_info_get_n_methods: {
    parameters: ["pointer"],
    result: "i32",
  },
  g_object_info_get_n_properties: {
    parameters: ["pointer"],
    result: "i32",
  },
  g_object_info_get_property: {
    parameters: ["pointer", "i32"],
    result: "pointer",
  },
  g_property_info_get_type: {
    parameters: ["pointer"],
    result: "pointer",
  },
  g_property_info_get_getter: {
    parameters: ["pointer"],
    result: "pointer",
  },
  g_property_info_get_setter: {
    parameters: ["pointer"],
    result: "pointer",
  },
  g_property_info_get_flags: {
    parameters: ["pointer"],
    result: "i32",
  },
  g_object_info_get_n_signals: {
    parameters: ["pointer"],
    result: "i32",
  },
  g_object_info_get_parent: {
    parameters: ["pointer"],
    result: "pointer",
  },
  g_object_info_get_signal: {
    parameters: ["pointer", "i32"],
    result: "pointer",
  },
  g_registered_type_info_get_g_type: {
    parameters: ["pointer"],
    result: "pointer",
  },
  g_struct_info_get_method: {
    parameters: ["pointer", "i32"],
    result: "pointer",
  },
  g_struct_info_get_n_methods: {
    parameters: ["pointer"],
    result: "i32",
  },
  g_type_info_get_interface: {
    parameters: ["pointer"],
    result: "pointer",
  },
  g_type_info_get_tag: {
    parameters: ["pointer"],
    result: "i32",
  },
  g_value_info_get_value: {
    parameters: ["pointer"],
    result: "i64",
  },
});

export default girepository.symbols;
