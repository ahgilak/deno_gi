import Gtk from "https://gir.deno.dev/Gtk-4.0";

const app = Gtk.Application.new("com.deno_gi.builder", 0);

const file = await fetch(import.meta.resolve("./template.ui"));
const template = await file.text();

app.on("activate", activate);

function activate(app: Gtk.Application) {
  const builder = Gtk.Builder.new_from_string(template, -1);
  const root = builder.get_object("root") as Gtk.Widget;

  const action_button = builder.get_object("action_button") as Gtk.Button;
  action_button.on("clicked", () => console.log("Action!"));
  const close_button = builder.get_object("close_button") as Gtk.Button;
  close_button.on("clicked", () => win.close());

  const win = Gtk.ApplicationWindow.new(app);
  win.set_default_size(200, 200);
  win.set_child(root);
  win.present();
}

app.run([]);
