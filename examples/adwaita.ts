import Gtk from "https://gir.deno.dev/Gtk-4.0";
import Adw from "https://gir.deno.dev/Adw-1";

const app = Adw.Application.new("com.deno_gi.adwaita", 0);

app.connect("activate", activate);

function activate() {
  const theme_button = Gtk.Button.new_from_icon_name("night-light-symbolic");
  theme_button.connect("clicked", toggleTheme);

  const title = Adw.WindowTitle.new("Deno GI", "Adwaita Example");

  const header_bar = Adw.HeaderBar.new();
  header_bar.set_title_widget(title);
  header_bar.pack_start(theme_button);

  const style_context = header_bar.get_style_context();
  style_context.add_class("flat");

  const page = Adw.StatusPage.new();
  page.set_title("Deno GI Adwaita Example");
  page.set_icon_name("start-here-symbolic");

  const handle = Gtk.WindowHandle.new();
  handle.set_child(page);

  const content = Gtk.Box.new(Gtk.Orientation.VERTICAL, 0);
  content.append(header_bar);
  content.append(handle);

  const win = Adw.ApplicationWindow.new(app);
  win.set_content(content);
  win.set_default_size(400, 400);
  win.present();
}

function toggleTheme() {
  const style_manager = Adw.StyleManager.get_default();
  const is_dark = style_manager.get_dark();

  style_manager.set_color_scheme(
    is_dark ? Adw.ColorScheme.FORCE_LIGHT : Adw.ColorScheme.FORCE_DARK,
  );
}

app.run([]);
