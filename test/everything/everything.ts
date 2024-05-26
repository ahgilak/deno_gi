// import Everything from "https://gir.deno.dev/Everything-1.0";

import { require } from "../../mod.ts";
import { assertEquals } from "../test_deps.ts";

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
  value: unknown;
}

const types: GIType[] = [
  {
    name: "filename",
    type: "string",
    value: "hello",
  },
];

for (const { name, type, value } of types) {
  Deno.test(`const_return_${name}`, () => {
    const value = Everything[`const_return_${name}`]();

    assertEquals(typeof value, type, `has incorrect return type`);
  });
}
