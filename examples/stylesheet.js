import * as gi from "../mod.js";

const Gtk = gi.require("Gtk", "4.0");
const Gdk = gi.require("Gdk", "4.0");

const style = await Deno.readFile(new URL(import.meta.resolve("./style.css")));

const app = Gtk.Application.new("com.deno_gi.stylesheet", 0);
const provider = Gtk.CssProvider.new();
provider.loadFromData(style, -1);

app.on("activate", () => {
  Gtk.StyleContext.addProviderForDisplay(
    Gdk.Display.getDefault(),
    provider,
    Gtk.STYLE_PROVIDER_PRIORITY_APPLICATION,
  );

  const win = Gtk.ApplicationWindow.new(app);
  const label = Gtk.Label.new("Hello World!");
  const box = new Gtk.Box();

  box.append(label);

  win.setChild(box);
  win.present();
});

app.run();
