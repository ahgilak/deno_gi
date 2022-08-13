import * as gi from "../mod.ts";

const Gtk = gi.require("Gtk", "4.0");

const app = new Gtk.Application();

app.on("activate", () => {
  const win = new Gtk.ApplicationWindow({ application: app });
  const contentArea = new Gtk.Box({
    marginTop: 50,
    marginBottom: 50,
    marginStart: 100,
    marginEnd: 100,
  });
  const label = new Gtk.Label({ label: "Hello World!" });

  contentArea.append(label);
  win.setChild(contentArea);
  win.present();
});

app.run();
