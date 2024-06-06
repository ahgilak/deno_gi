import Gtk from "https://gir.deno.dev/Gtk-4.0";
import Gdk from "https://gir.deno.dev/Gdk-4.0";

const file = await fetch(import.meta.resolve("./style.css"));
const style = await file.text();

const app = Gtk.Application.new("com.deno_gi.stylesheet", 0);
const provider = Gtk.CssProvider.new();

// @ts-expect-error - mismatch type defenition
provider.load_from_string(style);

app.connect("activate", () => {
  Gtk.StyleContext.add_provider_for_display(
    Gdk.Display.get_default()!,
    provider,
    Gtk.STYLE_PROVIDER_PRIORITY_APPLICATION,
  );

  const win = Gtk.ApplicationWindow.new(app);
  const label = Gtk.Label.new("Hello World!");
  const box = new Gtk.Box();

  box.append(label);

  win.set_child(box);
  win.show();
});

app.run([]);
