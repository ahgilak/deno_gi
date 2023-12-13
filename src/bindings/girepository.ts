import { libName, openLib } from "../base_utils/ffipp.js";

import {
  $bool,
  $buffer,
  $i32,
  $i64,
  $pointer,
  $string,
  $u64,
  $void,
} from "../base_utils/types.ts";

const { g } = openLib(libName("girepository-1.0", 1), {
  g: {
    irepository: {
      require: $void($pointer, $string, $string, $i32, $pointer),
      get_n_infos: $i32($pointer, $string),
      get_info: $pointer($pointer, $string, $i32),
      find_by_gtype: $pointer($pointer, $i64),
    },
    registered_type_info: {
      get_g_type: $i64($pointer),
    },
    base_info: {
      get_name: $string($pointer),
      is_deprecated: $bool($pointer),
      get_type: $i32($pointer),
      unref: $void($pointer),
    },
    constant_info: {
      get_type: $pointer($pointer),
      get_value: $i32($pointer, $buffer),
    },
    type_info: {
      get_tag: $i32($pointer),
      get_array_length: $i32($pointer),
      get_interface: $pointer($pointer),
      get_param_type: $pointer($pointer, $i32),
      is_zero_terminated: $bool($pointer),
    },
    enum_info: {
      get_n_values: $i32($pointer),
      get_value: $pointer($pointer, $i32),
    },
    value_info: {
      get_value: $i32($pointer),
    },
    callable_info: {
      get_n_args: $i32($pointer),
      get_arg: $pointer($pointer, $i32),
      get_return_type: $pointer($pointer),
    },
    function_info: {
      get_flags: $i32($pointer),
      invoke: $bool($pointer, $buffer, $i32, $buffer, $i32, $buffer, $buffer),
    },
    arg_info: {
      get_type: $pointer($pointer),
      is_skip: $bool($pointer),
      get_direction: $i32($pointer),
      get_ownership_transfer: $i32($pointer),
      is_caller_allocates: $bool($pointer),
      is_return_value: $bool($pointer),
    },
    struct_info: {
      get_n_methods: $i32($pointer),
      get_method: $pointer($pointer, $i32),
      get_n_fields: $i32($pointer),
      get_field: $pointer($pointer, $i32),
      get_size: $i32($pointer),
    },
    object_info: {
      get_n_methods: $i32($pointer),
      get_method: $pointer($pointer, $i32),
      get_parent: $pointer($pointer),
      get_n_interfaces: $i32($pointer),
      get_interface: $pointer($pointer, $i32),
      get_n_signals: $i32($pointer),
      get_signal: $pointer($pointer, $i32),
      get_n_properties: $i32($pointer),
      get_property: $pointer($pointer, $i32),
      get_n_vfuncs: $i32($pointer),
      get_vfunc: $pointer($pointer, $i32),
    },
    interface_info: {
      get_n_methods: $i32($pointer),
      get_method: $pointer($pointer, $i32),
      get_n_signals: $i32($pointer),
      get_signal: $pointer($pointer, $i32),
      get_n_vfuncs: $i32($pointer),
      get_vfunc: $pointer($pointer, $i32),
      get_n_properties: $i32($pointer),
      get_property: $pointer($pointer, $i32),
    },
    property_info: {
      get_flags: $i32($pointer),
      get_type: $pointer($pointer),
    },
    vfunc_info: {
      invoke: $bool(
        $pointer,
        $u64,
        $buffer,
        $i32,
        $buffer,
        $i32,
        $buffer,
        $buffer,
      ),
    },
    field_info: {
      get_flags: $i32($pointer),
      get_type: $pointer($pointer),
      get_field: $i32($pointer, $pointer, $buffer),
      set_field: $i32($pointer, $pointer, $buffer),
    },
  },
});

export default g;
