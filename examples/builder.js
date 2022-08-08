import * as gi from "../mod.js";

const Gtk = gi.require("Gtk", "4.0");

const app = Gtk.Application.new("com.deno_gi.builder", 0);

const template = await Deno.readTextFile(
  new URL(import.meta.resolve("./template.ui")),
);

app.on("activate", activate);

function activate() {
  const builder = Gtk.Builder.newFromString(template, -1);
  const root = builder.getObject("root");

  const actionButton = builder.getObject("actionButton");
  Object.setPrototypeOf(actionButton, Gtk.Button.prototype);
  actionButton.on("clicked", () => console.log("Action!"));

  const closeButton = builder.getObject("closeButton");
  Object.setPrototypeOf(closeButton, Gtk.Button.prototype);
  closeButton.on("clicked", () => win.close());

  const win = Gtk.ApplicationWindow.new(app);
  win.setDefaultSize(200, 200);
  win.setChild(root);
  win.present();
}

app.run();