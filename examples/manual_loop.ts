import GLib from "https://gir.deno.dev/GLib-2.0";
import Gtk from "https://gir.deno.dev/Gtk-4.0";

const loop = GLib.MainLoop.new(null, false);

Gtk.init();

const win = Gtk.Window.new();

win.setDefaultSize(400, 200);
win.on("destroy", () => loop.quit());
win.show();

loop.run();
