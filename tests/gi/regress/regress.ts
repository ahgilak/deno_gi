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

    if (isBit64Type(bits)) {
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

    if (isBit64Type(bits)) {
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

["uint8", "uint16", "uint32", "uint64", "uint", "size"].forEach((type) => {
  Deno.test(`no implicit conversion to unsigned for ${type}`, () => {
    const method = Regress[`test_${type}`];

    assertThrows(() => method(-42), "out of range");

    if (isBit64Type(type)) {
      assertThrows(() => method(-42n), "out of range");
    } else {
      assertThrows(() => method(-42n), "out of range");
    }
  });
});

// Infinity and NaN

// TODO: Not yet implemented
// ["int8", "int16", "int32", "int64", "short", "int", "long", "ssize"].forEach(
//   (type) => {
//     Deno.test(`converts to 0 for ${type}`, () => {
//       const method = Regress[`test_${type}`];

//       assertEquals(method(Infinity), 0);
//       assertEquals(method(-Infinity), 0);
//       assertEquals(method(NaN), 0);
//     });
//   },
// );

// ["uint8", "uint16", "uint32", "uint64", "ushort", "uint", "ulong", "size"]
//   .forEach(
//     (type) => {
//       Deno.test(`converts to 0 for ${type}`, () => {
//         const method = Regress[`test_${type}`];

//         assertEquals(method(Infinity), 0);
//         assertEquals(method(NaN), 0);
//       });
//     },
//   );

["float", "double"].forEach((type) => {
  Deno.test(`not for ${type}`, () => {
    const method = Regress[`test_${type}`];

    assertEquals(method(NaN), NaN);
    assertEquals(method(Infinity), Infinity);
    assertEquals(method(-Infinity), -Infinity);
  });
});
