import {libName, openLib} from "../base_utils/ffipp.ts";

import {$pointer, $string, $u32, $u8} from "../base_utils/types.ts";

const { g } = openLib(libName("glib-2.0", 0), {
  g: {
    quark_from_string: $u32($string),
    slist: {
      length: $u32($pointer),
      nth: $pointer($pointer, $u32),
    },
    SIZEOF_LONG: $u8,
    SIZEOF_SIZE_T: $u8,
    SIZEOF_SSIZE_T: $u8,
  },
});

export default g;
