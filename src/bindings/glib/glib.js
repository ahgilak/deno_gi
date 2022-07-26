import symbols from "./symbols.json" assert { type: "json" };
import enums from "./enums.json" assert { type: "json" };
import { suffix } from "../../utils.js";

const glib = Deno.dlopen(
  "libglib-2.0" + suffix,
  symbols,
);

export default { ...glib.symbols, ...enums };
