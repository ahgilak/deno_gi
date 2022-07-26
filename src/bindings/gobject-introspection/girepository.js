import symbols from "./symbols.json" assert { type: "json" };
import enums from "./enums.json" assert { type: "json" };
import { suffix } from "../../utils.js";

const girepository = Deno.dlopen(
  "libgirepository-1.0" + suffix,
  symbols,
);

export default { ...girepository.symbols, ...enums };
