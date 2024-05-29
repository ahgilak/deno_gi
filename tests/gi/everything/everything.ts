import { require } from "../../../mod.ts";
import { assert, assertEquals, assertStrictEquals } from "../../test_deps.ts";

const Everything = require("Everything", "1.0");

type Typeof =
  | "bigint"
  | "boolean"
  | "function"
  | "number"
  | "object"
  | "string"
  | "symbol"
  | "undefined";

interface GIType {
  name: string;
  type: Typeof;
  param_type?: Typeof;
  values: unknown[];
}

const types: GIType[] = [
  {
    name: "filename",
    type: "string",
    values: ["hello"],
  },
  {
    name: "gboolean",
    type: "boolean",
    values: [
      true,
      false,
    ],
  },
  {
    name: "gchar",
    type: "number",
    // this is super confusing
    param_type: "string",
    values: [
      -128,
      -15,
      0,
      39,
      127,
    ],
  },
  {
    name: "gdouble",
    type: "number",
    values: [
      0,
      // G_MINDOUBLE
      2.2250738585072014e-308,
      // G_MAXDOUBLE
      1.7976931348623157e+308,
    ],
  },
  {
    name: "gfloat",
    type: "number",
    values: [
      0,
      // G_MINFLOAT
      1.1754943508222875e-38,
      // G_MAXFLOAT
      3.4028234663852886e+38,
    ],
  },
  {
    name: "gint",
    type: "number",
    values: [
      0,
      // G_MININT
      -2147483648,
      // G_MAXINT
      2147483647,
    ],
  },
  {
    name: "gint16",
    type: "number",
    values: [
      0,
      // G_MININT16
      -32768,
      // G_MAXINT16
      32767,
    ],
  },
  {
    name: "gint32",
    type: "number",
    values: [
      0,
      // G_MININT32
      -2147483648,
      // G_MAXINT
      2147483647,
    ],
  },
  {
    name: "gint64",
    type: "bigint",
    values: [
      0n,
      // G_MININT64
      -9223372036854775808n,
      // G_MAXINT
      9223372036854775807n,
    ],
  },
  {
    name: "gint8",
    type: "number",
    values: [
      0,
      // G_MININT8
      -128,
      // G_MAXINT
      127,
    ],
  },
  {
    name: "gintptr",
    type: "bigint",
    values: [],
  },
  {
    name: "glong",
    type: "bigint",
    values: [
      0n,
      // G_MINLONG
      -9223372036854775808n,
      // G_MAXINT
      9223372036854775807n,
    ],
  },
  {
    name: "gpointer",
    // TODO: should pointer return something else...?
    // maybe a Deno.PointerValue?
    type: "object",
    values: [],
  },
  {
    name: "gshort",
    type: "number",
    values: [
      0,
      // G_MININT8
      -128,
      // G_MAXSHORT
      32767,
    ],
  },
  {
    name: "gsize",
    type: "bigint",
    values: [
      0n,
      // G_MAXSIZE
      18446744073709551615n,
    ],
  },
  {
    name: "gssize",
    type: "bigint",
    values: [
      0n,
      // G_MINSSIZE
      -9223372036854775808n,
      // G_MAXSSIZE
      9223372036854775807n,
    ],
  },
  {
    name: "GType",
    type: "bigint",
    values: [
      0n,
      10000000000n,
    ],
  },
  {
    name: "guint",
    type: "number",
    values: [
      0,
      // G_MAXUINT
      4294967295,
    ],
  },
  {
    name: "guint16",
    type: "number",
    values: [
      0,
      // G_MAXUINT16
      65535,
    ],
  },
  {
    name: "guint32",
    type: "number",
    values: [
      0,
      // G_MAXUINT32
      4294967295,
    ],
  },
  {
    name: "guint64",
    type: "bigint",
    values: [
      0n,
      // G_MAXUINT64
      18446744073709551615n,
    ],
  },
  {
    name: "guint8",
    type: "number",
    values: [
      0,
      // G_MAXUINT8
      255,
    ],
  },
  {
    name: "guintptr",
    type: "bigint",
    values: [
      0n,
      // G_MAXINT
      2147483647n,
    ],
  },
  {
    name: "gulong",
    type: "bigint",
    values: [
      0n,
      // G_MAXULONG
      18446744073709551615n,
    ],
  },
  {
    name: "gunichar",
    type: "string",
    values: [
      "H",
      "!",
      "✒",
    ],
  },
  {
    name: "gushort",
    type: "number",
    values: [
      0,
      // G_MAXUSHORT
      65535,
    ],
  },
  {
    name: "off_t",
    type: "bigint",
    values: [
      0n,
      // G_MINOFFSET
      -9223372036854775808n,
      // G_MAXOFFSET
      9223372036854775807n,
    ],
  },
  {
    name: "time_t",
    type: "bigint",
    values: [
      0n,
      // G_MAXTIME
      2147483647n,
    ],
  },
  {
    name: "utf8",
    type: "string",
    values: [
      "Hello, World!",
      "🐑⛰️🥻↪️",
      "₥∰",
    ],
  },
];

for (const { name, type, param_type, values } of types) {
  Deno.test(toCamelCase(`const_return_${name}`), ({ name: fname }) => {
    const value = Everything[fname]();

    assertEquals(typeof value, type, `has incorrect return type`);
  });

  Deno.test(toCamelCase(`one_outparam_${name}`), ({ name: fname }) => {
    const value = Everything[fname]();

    assertEquals(
      typeof value,
      param_type ?? type,
      `has incorrect output param`,
    );
  });

  for (const value of values) {
    const fname = toCamelCase(`oneparam_${name}`);
    Deno.test(`${fname} (passing ${value})`, () => {
      const ret = Everything[fname](value);

      assert(!ret, "must return null");
    });

    const pname = toCamelCase(`passthrough_one_${name}`);
    Deno.test(`${pname} (passing ${value})`, () => {
      const ret = Everything[pname](value);

      if (typeof value == "number" && Number.isSafeInteger(value)) {
        assertEquals(ret, value, "must loosely match the passed value");
      } else {
        assertStrictEquals(ret, value, "must match the passed value");
      }
    });
  }
}

Deno.test("nullfunc", () => {
  const value = Everything.nullfunc();

  assertEquals(value, null);
});

function toCamelCase(text: string) {
  return text.replaceAll(/[_-][a-z]/g, (s) => s.substring(1).toUpperCase());
}
