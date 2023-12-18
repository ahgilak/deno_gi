import { libName, openLib } from "../base_utils/ffipp.js";

import { $pointer, $string, $u32 } from "../base_utils/types.ts";

const { g } = openLib(libName("glib-2.0", 0), {
  g: {
    quark_from_string: $u32($string),
    slist: {
      length: $u32($pointer),
      nth: $pointer($pointer, $u32),
    },
  },
});

export default g;
