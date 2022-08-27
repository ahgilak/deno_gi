import GLib from "https://gir.deno.dev/GLib-2.0";
import Gtk from "https://gir.deno.dev/Gtk-4.0";

Gtk.init();

const context = GLib.MainContext.default();
let isRunning = true;

const win = Gtk.Window.new();
win.setDefaultSize(400, 200);
win.on("destroy", () => isRunning = false);
win.show();

while (isRunning) {
  context.iteration(true);
}
