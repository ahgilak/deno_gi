import { libName, openLib } from "../base_utils/ffipp.js";

import { $string, $u32 } from "../base_utils/types.ts";

const { g } = openLib(libName("glib-2.0", 0), {
  g: {
    quark_from_string: $u32($string),
  },
});

export default g;
