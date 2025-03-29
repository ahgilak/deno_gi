import glib from "./glib.ts";
import gir from "./girepository.ts";
import gobject from "./gobject.ts";

export default { ...gir, ...gobject, ...glib };
