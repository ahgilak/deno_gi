import { require } from "../mod.ts";
const GLib = require("GLib", "2.0");
const Gtk = require("Gtk", "4.0");

// checks for the working of the GLib.Bytes class

const string = "Hello World";
const array = new TextEncoder().encode(string);

const bytes = GLib.Bytes.new(array, array.length);

const byteData = bytes.getData();
const byteSize = bytes.getSize();

console.log("bytes", bytes);
console.log("bytes data", byteData);
console.log("bytes size", byteSize);
console.log("original data string", new TextDecoder().decode(array));
console.log("bytes data string", new TextDecoder().decode(byteData[0]));

// checks for working of constants

console.log("MAXUINT32", GLib.MAXUINT32);
console.log("MAXUINT8", GLib.MAXUINT8);
console.log(
  "max bigint vs JS MAX_SAFE_INTEGER",
  GLib.MAXUINT32,
  Number.MAX_SAFE_INTEGER,
);
console.log(
  "GLib version",
  GLib.MAJOR_VERSION,
  GLib.MINOR_VERSION,
  GLib.MICRO_VERSION,
);

// tests working fields

const error = GLib.Error.newLiteral(
  10,
  20,
  "test error",
);
console.log("error", error);
console.log("error domain", error.domain);
console.log("error code", error.code);
console.log("error message", error.message);

// test working properties

Gtk.init();

const label = new Gtk.Label();
label.label = "Hello World";
console.log("label", label);
console.log("label label", label.label);
