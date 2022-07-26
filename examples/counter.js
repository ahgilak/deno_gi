import * as gi from "../mod.js";

const Gtk = gi.require("Gtk", "4.0");

const app = Gtk.Application.new("org.deno_gi.counter", 0);

app.on("activate", () => {
  const win = Gtk.ApplicationWindow.new(app);
  win.setTitle("Gtk Counter Example");
  win.setDefaultSize(320, 140);

  const contentArea = Gtk.Box.new(Gtk.Orientation.HORIZONTAL, 20);
  contentArea.setHalign(Gtk.Align.CENTER);
  contentArea.setValign(Gtk.Align.CENTER);

  let n = 0;
  const counterLabel = Gtk.Label.new(n);
  const decreaseButton = Gtk.Button.newWithLabel("-");
  const increaseButton = Gtk.Button.newWithLabel("+");

  decreaseButton.on("clicked", () => counterLabel.setText(--n));
  increaseButton.on("clicked", () => counterLabel.setText(++n));

  contentArea.append(decreaseButton);
  contentArea.append(counterLabel);
  contentArea.append(increaseButton);

  win.setChild(contentArea);
  win.present();
});

app.run();
