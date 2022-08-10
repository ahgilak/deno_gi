import symbols from "./symbols.json" assert { type: "json" };
import { library } from "../../utils.js";

const gobject = Deno.dlopen(
  library("gobject-2.0", 0),
  symbols,
);

export default gobject.symbols;
