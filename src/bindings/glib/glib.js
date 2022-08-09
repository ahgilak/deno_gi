import symbols from "./symbols.json" assert { type: "json" };
import enums from "./enums.json" assert { type: "json" };
import { library } from "../../utils.js";

const glib = Deno.dlopen(
  library("glib-2.0", 0),
  symbols,
);

export default { ...glib.symbols, ...enums };
