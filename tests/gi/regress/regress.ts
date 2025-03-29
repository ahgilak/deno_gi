// Adapted from: https://gitlab.gnome.org/GNOME/gjs/-/blob/fe6ef0d9f6928521592e3d1558ef5caa5e23817b/installed-tests/js/testRegress.js

import {require} from "https://github.com/ahgilak/deno_gi/raw/main/mod.ts";
import {assert, assertAlmostEquals, assertEquals, assertFalse, assertThrows,} from "../../test_deps.ts";
import {assertEqualNumbers, isBit64Type} from "../../utils/asserts.ts";

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

["int", "gint8", "gint16", "gint32", "gint64"].forEach((inttype) => {
  Deno.test(`arrays of ${inttype} in`, () => {
    const method = Regress[`test_array_${inttype}_in`];
    assertEquals(Number(method([1, 2, 3, 4])), 10);
  });
});

Deno.test("implicit conversions from strings to int arrays", () => {
  assertEquals(Regress.test_array_gint8_in("\x01\x02\x03\x04"), 10);
  assertEquals(Regress.test_array_gint16_in("\x01\x02\x03\x04"), 10);
  assertEquals(Regress.test_array_gint16_in("\u0100\u0200\u0300\u0400"), 2560);
});

Deno.test("out arrays of integers", () => {
  assertEquals(Regress.test_array_int_out(), [0, 1, 2, 3, 4]);
});

Deno.test("String arrays", async (t) => {
  await t.step("marshalling in", () => {
    assert(Regress.test_strv_in(["1", "2", "3"]));
    assertFalse(Regress.test_strv_in(["4", "5", "6"]));
    // Ensure that primitives throw without SEGFAULT
    assertThrows(() => Regress.test_strv_in(1), TypeError);
    // TODO: Fix
    // assertEquals(Regress.test_strv_in(""), 12);
    // assertThrows(() => Regress.test_strv_in(false), TypeError);
    // Second two are deliberately not strings
    // assertThrows(() => Regress.test_strv_in(["1", 2, 3]), TypeError);
  });

  await t.step("marshalling out", () => {
    assertEquals(Regress.test_strv_out(), [
      "thanks",
      "for",
      "all",
      "the",
      "fish",
    ]);
  });

  await t.step("marshalling return value with container transfer", () => {
    assertEquals(Regress.test_strv_out_container(), ["1", "2", "3"]);
  });

  await t.step("marshalling out parameter with container transfer", () => {
    assertEquals(Regress.test_strv_outarg(), ["1", "2", "3"]);
  });
});

Deno.test("GType arrays", () => {
  const Gio = require("Gio", "2.0");

  assertEquals(
    Regress.test_array_gtype_in([
      Gio.SimpleAction,
      Gio.Icon,
      // GObject.TYPE_BOXED,
    ]),
    "[GSimpleAction,GIcon,]",
  );
  assertThrows(() => Regress.test_array_gtype_in(42), TypeError);
  assertThrows(() => Regress.test_array_gtype_in([undefined]), TypeError);
  // assertThrows(() => Regress.test_array_gtype_in([80]));
});

Deno.test("arrays of integers with length parameter", async (t) => {
  await t.step("marshals as a return value with transfer full", () => {
    assertEquals(Regress.test_array_int_full_out(), [0, 1, 2, 3, 4]);
  });

  await t.step("marshals as a return value with transfer none", () => {
    assertEquals(Regress.test_array_int_none_out(), [1, 2, 3, 4, 5]);
  });

  await t.step("marshalls as a nullable in parameter", () => {
    assert(Regress.test_array_int_null_in(null));
  });

  await t.step("marshals as a nullable return value", () => {
    assertEquals(Regress.test_array_int_null_out(), []);
  });
});
