# Deno GI

Port of Gnome Libraries for Deno using gobject-introspection.

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
