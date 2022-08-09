# Deno GI

Port of Gnome libraries (like Gtk) for Deno using gobject-introspection.

> **Early Stage and Unstable**

## Usage

### Loading a library

Loading a library is done by calling `require` function.

Loading Gtk:

```js
import * as gi from "https://deno.land/x/deno_gi/mod.js";
const Gtk = gi.require("Gtk", "4.0");
```

> If you don't explicitly define version, the latest version will be loaded

### Creating Objects

Objects are initialized using creation functions or javascript constructors.

```js
// creation function
const button = Gtk.Button.newWithLabel("Click Me!");

// js constructor
const button = new Gtk.Button({ label: "Click Me!" });
```

### Signals

Signals are connected using `on` method.

```js
button.on("clicked", () => {
  console.log("Clicked");
});
```

## Example

```js
import * as gi from "https://deno.land/x/deno_gi/mod.js";

const Gtk = gi.require("Gtk", "4.0");

const app = new Gtk.Application();

app.on("activate", () => {
  const win = new Gtk.ApplicationWindow({ application: app });
  const contentArea = new Gtk.Box();
  const label = new Gtk.Label({ label: "Hello World!" });

  contentArea.append(label);
  win.setChild(contentArea);
  win.present();
});

app.run();
```

> Run the example with `--allow-ffi` and `--unstable` flags.

See more examples on [examples](./examples) folder.
