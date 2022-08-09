import symbols from "./symbols.json" assert { type: "json" };
import enums from "./enums.json" assert { type: "json" };
import { library } from "../../utils.js";

const girepository = Deno.dlopen(
  library("girepository-1.0", 1),
  symbols,
);

export default { ...girepository.symbols, ...enums };
