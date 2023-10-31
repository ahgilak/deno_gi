import Gtk from "https://gir.deno.dev/Gtk-4.0";
import Adw from "https://gir.deno.dev/Adw-1";

const app = Adw.Application.new("com.deno_gi.adwaita", 0);

app.on("activate", activate);

function activate() {
  const themeButton = Gtk.Button.newFromIconName("night-light-symbolic");
  themeButton.on("clicked", toggleTheme);

  const title = Adw.WindowTitle.new("Deno GI", "Adwaita Example");

  const headerBar = Adw.HeaderBar.new();
  headerBar.setTitleWidget(title);
  headerBar.packStart(themeButton);

  const styleContext = headerBar.getStyleContext();
  styleContext.addClass("flat");

  const page = Adw.StatusPage.new();
  page.setTitle("Deno GI Adwaita Example");
  page.setIconName("start-here-symbolic");

  const handle = Gtk.WindowHandle.new();
  handle.setChild(page);

  const content = Gtk.Box.new(Gtk.Orientation.VERTICAL, 0);
  content.append(headerBar);
  content.append(handle);

  const win = Adw.ApplicationWindow.new(app);
  win.setContent(content);
  win.setDefaultSize(400, 400);
  win.present();
}

function toggleTheme() {
  const styleManager = Adw.StyleManager.getDefault();
  const isDark = styleManager.getDark();

  styleManager.setColorScheme(
    isDark ? Adw.ColorScheme.FORCE_LIGHT : Adw.ColorScheme.FORCE_DARK,
  );
}

app.run([]);
