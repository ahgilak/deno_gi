import { require } from "../mod.ts";
const Gtk = require("Gtk", "4.0");

const app = Gtk.Application.new("com.deno_gi.builder", 0);

const file = await fetch(import.meta.resolve("./template.ui"));
const template = await file.text();

app.on("activate", activate);

function activate(app: Gtk.Application) {
  const builder = Gtk.Builder.newFromString(template, -1);
  const root = builder.getObject("root") as Gtk.Widget;

  const actionButton = builder.getObject("actionButton") as Gtk.Button;
  actionButton.on("clicked", () => console.log("Action!"));
  const closeButton = builder.getObject("closeButton") as Gtk.Button;
  closeButton.on("clicked", () => win.close());

  const win = Gtk.ApplicationWindow.new(app);
  win.setDefaultSize(200, 200);
  win.setChild(root);
  win.present();
}

app.run([]);
