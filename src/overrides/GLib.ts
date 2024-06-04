// deno-lint-ignore-file no-explicit-any
function addErrorTag(GLib: any) {
  Object.defineProperty(GLib.Error.prototype, Symbol.toStringTag, {
    get() {
      return this.message;
    },
  });
}

export function _init(GLib: any) {
  addErrorTag(GLib);
}
