import { libName, openLib } from "../base_utils/ffipp.js";

import {
  $bool,
  $buffer,
  $f32,
  $f64,
  $i32,
  $i64,
  $i8,
  $pointer,
  $string,
  $u32,
  $u64,
  $u8,
  $void,
} from "../base_utils/types.ts";

const { g } = openLib(libName("gobject-2.0", 0), {
  g: {
    object: {
      new: $pointer($i64, $pointer),
      get_property: $void($pointer, $string, $buffer),
      set_property: $void($pointer, $string, $buffer),
    },
    signal: {
      connect_data: $pointer(
        $pointer,
        $string,
        $pointer,
        $pointer,
        $pointer,
        $i32,
      ),
      emit_by_name: $void($pointer, $string),
      handler_disconnect: $void($pointer, $pointer),
    },
    type: {
      default_interface_ref: $pointer($i64),
      parent: $i64($i64),
      is_a: $bool($i64, $i64),
      query: $pointer($i64),
    },
    type_class: {
      ref: $pointer($i64),
    },
    object_class: {
      find_property: $pointer($pointer, $string),
    },
    object_interface: {
      find_property: $pointer($pointer, $string),
    },
    value: {
      init: $void($buffer, $i64),
      set_char: $void($buffer, $i8),
      set_uchar: $void($buffer, $u8),
      set_boolean: $void($buffer, $i32),
      set_int: $void($buffer, $i32),
      set_uint: $void($buffer, $u32),
      set_long: $void($buffer, $i64),
      set_ulong: $void($buffer, $u64),
      set_int64: $void($buffer, $i64),
      set_uint64: $void($buffer, $u64),
      set_enum: $void($buffer, $i32),
      set_flags: $void($buffer, $i32),
      set_float: $void($buffer, $f32),
      set_double: $void($buffer, $f64),
      set_string: $void($buffer, $i64),
      set_pointer: $void($buffer, $i64),
      set_object: $void($buffer, $i64),
      set_boxed: $void($buffer, $i64),
      get_char: $i8($buffer),
      get_uchar: $u8($buffer),
      get_boolean: $bool($buffer),
      get_int: $i32($buffer),
      get_uint: $u32($buffer),
      get_long: $i64($buffer),
      get_ulong: $u64($buffer),
      get_int64: $i64($buffer),
      get_uint64: $u64($buffer),
      get_enum: $i32($buffer),
      get_flags: $i32($buffer),
      get_float: $f32($buffer),
      get_double: $f64($buffer),
      get_string: $pointer($buffer),
      get_pointer: $pointer($buffer),
      get_object: $pointer($buffer),
      get_boxed: $pointer($buffer),
    },
  },
});

export default g;
