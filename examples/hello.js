import * as gi from "../mod.js";

const Gtk = gi.require("Gtk", "4.0");

const application = new Gtk.Application();

application.on("activate", () => {
  const win = new Gtk.ApplicationWindow({ application });
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

application.run();
