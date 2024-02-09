import Gtk from "https://gir.deno.dev/Gtk-4.0";
import GObject from "https://gir.deno.dev/GObject-2.0";

class Box extends Gtk.Box {
  static {
    GObject.registerClass({
      GTypeName: "Box",
      Template: "file:///home/alien/sites/deno_gi/examples/template2.ui",
      Children: ["actionButton", "closeButton"],
    }, this);
  }
}

class App extends Gtk.Application {
  static {
    GObject.registerClass({
      GTypeName: "App",
    }, this);
  }

  vfunc_activate() {
    const root = new Box();
    root.actionButton.on("clicked", () => console.log("Action!"));
    root.closeButton.on("clicked", () => win.close());

    const win = Gtk.ApplicationWindow.new(this);
    win.setDefaultSize(200, 200);
    win.setChild(root);
    win.present();
  }
}

const app = new App();

app.run([]);
