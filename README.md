# Deno GI

Deno port of Gnome libraries (such as Gtk).

> **Early Stage and Unstable**

## Usage

You must specify `--allow-ffi` and `--unstable-ffi` flags to run your program.

```sh
deno run --allow-ffi --unstable-ffi <file>
```

### Loading a library

Import libraries from `gir.deno.dev` to load them.

Loading Gtk:

```ts
import Gtk from "https://gir.deno.dev/Gtk-4.0";
```

### Creating Objects

Objects are initialized using creation functions or javascript constructors.

Creating a GtkButton:

```ts
const button = Gtk.Button.newWithLabel("Click Me!");
```

or

```ts
const button = new Gtk.Button({ label: "Click Me!" });
```

### Signals

Signals are connected using `on` method.

Connecting `clicked` signal to a button:

```ts
button.connect("clicked", () => {
  console.log("Clicked");
});
```

## Example

```ts
import Gtk from "https://gir.deno.dev/Gtk-4.0";

const app = new Gtk.Application();

app.connect("activate", () => {
  const win = new Gtk.ApplicationWindow({ application: app });
  const contentArea = new Gtk.Box();
  const label = new Gtk.Label({ label: "Hello World!" });

  contentArea.append(label);
  win.set_child(contentArea);
  win.present();
});

app.run([]);
```

See more examples on [examples] folder.

## Dependencies

Deno GI depends on `gobject-introspection`.

### Fedora

```sh
dnf install gobject-introspection
```

### Ubuntu

```sh
apt install gobject-introspection
```

### Arch

```sh
pacman -S gobject-introspection
```

### macOS

```sh
brew install gobject-introspection
```

### Windows

1. Install MSYS2.
2. Add `C:\msys64\mingw64\bin` to system path.
3. Run in msys shell:

```sh
pacman -S mingw-w64-x86_64-gobject-introspection
```

Additional libraries such as `gtk4` and `libadwaita` are used in [examples].
Their installation process is the same as `gobject-introspection`.

## Related Projects

- [Gjs]
- [node-gtk]

[examples]: ./examples/
[Gjs]: https://gitlab.gnome.org/GNOME/gjs
[node-gtk]: https://github.com/romgrk/node-gtk
