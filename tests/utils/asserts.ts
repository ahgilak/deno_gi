import {assertEquals} from "../test_deps.ts";
import GLib from "GLib::2.0";

const bit64Types = ["uint64", "int64"];
if (GLib.SIZEOF_LONG === 8) {
  bit64Types.push("long", "ulong");
}
if (GLib.SIZEOF_SIZE_T === 8) {
  bit64Types.push("size");
}
if (GLib.SIZEOF_SSIZE_T === 8) {
  bit64Types.push("ssize");
}

export function assertEqualNumbers(
  bits: string | number,
  actual: number | bigint,
  expected: number | bigint,
) {
  if (isBit64Type(bits)) {
    assertEquals(actual, BigInt(expected));
  } else {
    assertEquals(actual, expected);
  }
}

export function isBit64Type(bits: string | number) {
  if (typeof bits == "string") {
    return bit64Types.includes(bits);
  } else {
    return bits >= 64;
  }
}
