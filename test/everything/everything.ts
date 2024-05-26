import { require } from "../../mod.ts";
import { assert, assertEquals, assertStrictEquals } from "../test_deps.ts";

const Everything = require("Everything", "1.0");

interface GIType {
  name: string;
  type:
    | "bigint"
    | "boolean"
    | "function"
    | "number"
    | "object"
    | "string"
    | "symbol"
    | "undefined";
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
      // true,
      // false,
    ],
  },
  {
    name: "gchar",
    type: "number",
    values: [
      // -128,
      // -15,
      // 0,
      // 39,
      // 127,
    ],
  },
  {
    name: "gdouble",
    type: "bigint",
    values: [
      // 1,
      // 2,
      // 3,
      // 9192939393,
      // // TODO: BigInts
      // // 1213231232312323123323233n,
      // // G_MAXDOUBLE
      // 1.7976931348623157e+308,
      // // G_MINDOUBLE
      // 2.2250738585072014e-308,
    ],
  },
  {
    name: "gfloat",
    type: "number",
    values: [],
  },

  {
    name: "gint",
    type: "number",
    values: [],
  },

  {
    name: "gint16",
    type: "number",
    values: [],
  },

  {
    name: "gint32",
    type: "number",
    values: [],
  },

  {
    name: "gint64",
    type: "bigint",
    values: [],
  },

  {
    name: "gint8",
    type: "number",
    values: [],
  },
  {
    name: "gintptr",
    type: "bigint",
    values: [],
  },
  {
    name: "glong",
    type: "bigint",
    values: [],
  },
  {
    name: "gpointer",
    // TODO: should pointer return something else...?
    // maybe a Deno.PointerValue?
    type: "undefined",
    values: [],
  },
  {
    name: "gshort",
    type: "number",
    values: [],
  },
  {
    name: "gsize",
    type: "bigint",
    values: [],
  },
  {
    name: "gssize",
    type: "bigint",
    values: [],
  },
  {
    name: "GType",
    type: "bigint",
    values: [],
  },
  {
    name: "guint",
    type: "number",
    values: [],
  },
  {
    name: "guint16",
    type: "number",
    values: [],
  },
  {
    name: "guint32",
    type: "number",
    values: [],
  },
  {
    name: "guint64",
    type: "bigint",
    values: [],
  },
  {
    name: "guint8",
    type: "number",
    values: [],
  },
  {
    name: "guintptr",
    type: "bigint",
    values: [],
  },
  {
    name: "gulong",
    type: "bigint",
    values: [],
  },
  {
    name: "gunichar",
    type: "string",
    values: [],
  },
  {
    name: "gushort",
    type: "number",
    values: [],
  },
  {
    name: "off_t",
    type: "bigint",
    values: [],
  },
  {
    name: "time_t",
    type: "bigint",
    values: [],
  },
  {
    name: "utf8",
    type: "string",
    values: [],
  },
];

for (const { name, type, values } of types) {
  Deno.test(toCamelCase(`const_return_${name}`), ({ name: fname }) => {
    const value = Everything[fname]();

    assertEquals(typeof value, type, `has incorrect return type`);
  });

  Deno.test(toCamelCase(`const_return_${name}`), ({ name: fname }) => {
    const value = Everything[fname]();

    assertEquals(typeof value, type, `has incorrect output param`);
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

      assertStrictEquals(ret, value, "must return the passed value");
    });
  }
}

Deno.test("nullfunc", () => {
  const value = Everything.nullfunc();

  // TODO: should return `null`, not `undefined`
  assertEquals(value, undefined);
});

function toCamelCase(text: string) {
  return text.replaceAll(/[_-][a-z]/g, (s) => s.substring(1).toUpperCase());
}
