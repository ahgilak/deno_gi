// deno-lint-ignore-file no-explicit-any
// adapted from https://gitlab.gnome.org/GNOME/gjs/-/blob/HEAD/modules/core/overrides/Gtk.js

import { require } from "../gi.js";
import type { Metadata } from "./GObject.ts";

function getDeps() {
  return {
    Gio: require("Gio", "2.0"),
    GLib: require("GLib", "2.0"),
    GObject: require("GObject", "2.0"),
    Gtk: require("Gtk", "4.0"),
  };
}

export function widgetInit(this: any) {
  const { Gtk } = getDeps();

  const klass = this.constructor as typeof Gtk.Widget;
  const metaInfo = Reflect.getOwnMetadata(
    "gi:metaInfo",
    klass,
  ) as Metadata | undefined;

  if (metaInfo?.Template) {
    this.initTemplate();

    const gType = Reflect.getOwnMetadata("gi:gtype", klass);

    const children = metaInfo.Children ?? [];
    for (const child of children) {
      this[child.replace(/-/g, "_")] = this.getTemplateChild(gType, child);
    }

    const internalChildren = metaInfo.InternalChildren ?? [];
    for (const child of internalChildren) {
      this["_" + child.replace(/-/g, "_")] = this.getTemplateChild(
        gType,
        child,
      );
    }
  }
}

export function registerWidgetClass(this: any) {
  const { Gtk, GLib, GObject, Gio } = getDeps();

  const metaInfo = Reflect.getOwnMetadata("gi:metaInfo", this) as Metadata;

  const registerObjectClass = Reflect.getMetadata(
    "gi:registerClass",
    GObject.Object,
  );

  registerObjectClass.call(this, metaInfo);

  if (metaInfo.CssName) {
    Gtk.Widget.setCssName.call(this, metaInfo.CssName);
  }

  if (metaInfo.Template) {
    if (typeof metaInfo.Template === "string") {
      try {
        const uri = GLib.Uri.parse(metaInfo.Template, GLib.UriFlags.NONE);
        const scheme = uri.getScheme();

        if (scheme === "resource") {
          Gtk.Widget.setTemplateFromResource.call(this, uri.getPath());
        } else if (scheme === "file") {
          const file = Gio.File.newForUri(metaInfo.Template);
          const [bytes] = file.loadBytes(null);
          Gtk.Widget.setTemplate.call(this, bytes);
        } else {
          throw new TypeError(`Invalid template URI: ${metaInfo.Template}`);
        }
      } catch (error) {
        if (!(error instanceof GLib.UriError)) {
          throw error;
        }

        const contents = new TextEncoder().encode(metaInfo.Template);
        // TODO: this should be automatic
        const contentsBytes = GLib.Bytes.newTake(contents, contents.length);
        this.setTemplate(contentsBytes);
      }
    } else {
      this.setTemplate(metaInfo.Template);
    }

    // Gtk.Widget.setTemplateScope.call(this, new BuilderScope());
  }

  if (metaInfo.Children) {
    metaInfo.Children.forEach((child: string) => {
      Gtk.Widget.bindTemplateChildFull.call(this, child, false, 0);
    });
  }

  if (metaInfo.InternalChildren) {
    metaInfo.InternalChildren.forEach((child: string) => {
      Gtk.Widget.bindTemplateChildFull.call(this, child, true, 0);
    });
  }
}

export function _init(Gtk: any) {
  Reflect.defineMetadata("gi:registerClass", registerWidgetClass, Gtk.Widget);
  Reflect.defineMetadata("gi:instance_init", widgetInit, Gtk.Widget);
}
