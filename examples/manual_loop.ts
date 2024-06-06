import GLib from "https://gir.deno.dev/GLib-2.0";
import Gtk from "https://gir.deno.dev/Gtk-4.0";

Gtk.init();

const context = GLib.MainContext.default();
let isRunning = true;

const win = Gtk.Window.new();
win.setDefaultSize(400, 200);
win.connect("destroy", () => isRunning = false);
win.present();

setTimeout(() => console.log("Hello World"), 2000);

function iterate() {
  context.iteration(true);
  if (isRunning) {
    return setTimeout(iterate, 0);
  }
}

iterate();
