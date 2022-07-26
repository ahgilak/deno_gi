import * as gi from "../mod.js";

const GLib = gi.require("GLib", "2.0");
const Gtk = gi.require("Gtk", "4.0");

const loop = GLib.MainLoop.new(null, false);

Gtk.init();

const win = Gtk.Window.new();

win.setDefaultSize(400, 200);
win.on("destroy", () => loop.quit());
win.present();

loop.run();
