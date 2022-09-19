import Gtk from "https://gir.deno.dev/Gtk-4.0";
import Gdk from "https://gir.deno.dev/Gdk-4.0";

const file = await fetch(import.meta.resolve("./style.css"));
const style = await file.arrayBuffer();

const app = Gtk.Application.new("com.deno_gi.stylesheet", 0);
const provider = Gtk.CssProvider.new();

provider.loadFromData(new Uint8Array(style));

app.on("activate", () => {
  Gtk.StyleContext.addProviderForDisplay(
    Gdk.Display.getDefault()!,
    provider,
    Gtk.STYLE_PROVIDER_PRIORITY_APPLICATION,
  );

  const win = Gtk.ApplicationWindow.new(app);
  const label = Gtk.Label.new("Hello World!");
  const box = new Gtk.Box();

  box.append(label);

  win.setChild(box);
  win.show();
});

app.run([]);
