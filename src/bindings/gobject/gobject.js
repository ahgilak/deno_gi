import symbols from "./symbols.json" assert { type: "json" };
import enums from "./enums.json" assert { type: "json" };
import { suffix } from "../../utils.js";

const gobject = Deno.dlopen(
  "libgobject-2.0" + suffix,
  symbols,
);

export default { ...gobject.symbols, ...enums };
