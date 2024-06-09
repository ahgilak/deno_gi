// Adapted from: https://gitlab.gnome.org/GNOME/gjs/-/blob/fe6ef0d9f6928521592e3d1558ef5caa5e23817b/installed-tests/js/testRegress.js

import { require } from "../../../mod.ts";
import {
  assertAlmostEquals,
  assertEquals,
  assertThrows,
} from "../../test_deps.ts";
import { assertEqualNumbers, isBit64Type } from "../../utils/asserts.ts";

const Regress = require("Regress", "1.0");

Deno.test("includes null return value", () => {
  assertEquals(Regress.test_return_allow_none(), null);
  assertEquals(Regress.test_return_nullable(), null);
});

Deno.test("includes booleans", () => {
  assertEquals(Regress.test_boolean(false), false);
  assertEquals(Regress.test_boolean(true), true);
  assertEquals(Regress.test_boolean_true(true), true);
  assertEquals(Regress.test_boolean_false(false), false);
});

[8, 16, 32, 64].forEach((bits) => {
  Deno.test(`includes ${bits}-bit integers`, () => {
    const method = Regress[`test_int${bits}`];

    assertEqualNumbers(bits, method(42), 42);
    assertEqualNumbers(bits, method(-42), -42);
    assertEqualNumbers(bits, method(undefined), 0);
    assertEqualNumbers(bits, method(42.42), 42);
    assertEqualNumbers(bits, method(-42.42), -42);

    if (bits >= 64) {
      assertEquals(method(42n), 42n);
      assertEquals(method(-42n), -42n);
    } else {
      // TODO: these should really throw a `RangeError`
      assertThrows(() => method(42n), TypeError);
      assertThrows(() => method(-42n), TypeError);
    }
  });

  Deno.test(`includes unsigned ${bits}-bit integers`, () => {
    const method = Regress[`test_uint${bits}`];

    assertEqualNumbers(bits, method(42), 42);
    assertEqualNumbers(bits, method(undefined), 0);
    assertEqualNumbers(bits, method(42.42), 42);

    if (bits >= 64) {
      assertEquals(method(42n), 42n);
    } else {
      assertThrows(() => method(42n), TypeError);
    }
  });
});

["short", "int", "long", "ssize", "float", "double"].forEach((type) => {
  Deno.test(`includes ${type}s`, () => {
    const method = Regress[`test_${type}`];

    assertEqualNumbers(type, method(42), 42);
    assertEqualNumbers(type, method(-42), -42);
    assertEqualNumbers(type, method(undefined), 0);

    if (["float", "double"].includes(type)) {
      // TODO: fix, should return NaN
      // assertEquals(method(undefined), NaN);
      assertAlmostEquals(method(42.42), 42.42, 1e-5);
      assertAlmostEquals(method(-42.42), -42.42, 1e-5);
    } else {
      assertEqualNumbers(type, method(42.42), 42);
      assertEqualNumbers(type, method(-42.42), -42);
    }

    if (isBit64Type(type)) {
      assertEquals(method(42n), 42n);
      assertEquals(method(-42n), -42n);
    } else {
      assertThrows(() => method(42n), TypeError);
      assertThrows(() => method(-42n), TypeError);
    }
  });
});

["ushort", "uint", "ulong", "size"].forEach((type) => {
  Deno.test(`includes ${type}s`, () => {
    const method = Regress[`test_${type}`];

    assertEqualNumbers(type, method(42), 42);
    assertEqualNumbers(type, method(42.42), 42);
    assertEqualNumbers(type, method(undefined), 0);

    if (isBit64Type(type)) {
      assertEquals(method(42n), 42n);
    } else {
      assertThrows(() => method(42n), TypeError);
    }
  });
});

// TODO: implement
// ["uint8", "uint16", "uint32", "uint64", "uint", "size"].forEach((type) => {
//   Deno.test(`no implicit conversion to unsigned for ${type}`, () => {
//     const method = Regress[`test${capitalize(type)}`];

//     assertThrows(() => method(-42), TypeError);

//     if (isBit64Type(type)) {
//       assertThrows(method(-42n), TypeError);
//     } else {
//       assertThrows(method(-42n), TypeError);
//     }
//   });
// });
