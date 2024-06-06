import Gtk from "https://gir.deno.dev/Gtk-4.0";

const app = new Gtk.Application();

app.connect("activate", () => {
  const win = new Gtk.ApplicationWindow({ application: app });
  const content_area = new Gtk.Box({
    margin_top: 50,
    margin_bottom: 50,
    margin_start: 100,
    margin_end: 100,
  });
  const label = Gtk.Label.new("Hello World!");
  content_area.append(label);
  win.set_child(content_area);
  win.present();
});

app.run([]);
