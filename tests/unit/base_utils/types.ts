import {
  $bool,
  $buffer,
  $f32,
  $f64,
  $i32,
  $i64,
  $i8,
  $pointer,
  $string,
  $u32,
  $u64,
  $u8,
  $void,
} from "../../../src/base_utils/types.ts";
import {assert, assertEquals} from "../../test_deps.ts";

Deno.test("$pointer", () => {
  const typedArray = new TextEncoder().encode("test\0");
  const pointer = Deno.UnsafePointer.of(typedArray.buffer);
  assert(pointer);

  assertEquals($pointer.symbol, "pointer");
  assertEquals($pointer.size, 8);
  // VERY IMPORTANT!
  // TODO: these tests should throw if unallowed values are given!!!
  assertEquals(
    $pointer.serialize(pointer),
    pointer,
    "should get serialized into a pointer",
  );
  assertEquals(
    $pointer.deserialize(pointer),
    pointer,
    "should be deserialized into a pointer",
  );
});

Deno.test("$buffer", () => {
  const typedArray = new TextEncoder().encode("test\0");
  const pointer = Deno.UnsafePointer.of(typedArray.buffer);
  assert(pointer);

  assertEquals($buffer.symbol, "buffer");
  assertEquals($buffer.size, 8);
  assertEquals(
    $buffer.serialize(typedArray),
    typedArray,
    "should get serialized into a pointer",
  );
  assertEquals(
    $buffer.deserialize(pointer),
    pointer,
    "should be deserialized into a pointer",
  );
});

Deno.test("$void", () => {
  assertEquals($void.symbol, "void");
  assertEquals($void.size, 0);
  assertEquals(
    $void.serialize(12),
    undefined,
    "should get serialized into undefined",
  );
  assertEquals(
    $void.deserialize(12),
    undefined,
    "should be deserialized into undefined",
  );
});

Deno.test("$string", () => {
  const hello_world = "hello, world!";

  const encoder = new TextEncoder();

  assertEquals($string.symbol, "buffer");
  assertEquals($string.size, 8);

  /** serialize */
  assertEquals(
    $string.serialize(null as unknown as undefined),
    null,
    "should serialize null to null pointer",
  );
  assertEquals(
    $string.serialize(undefined),
    null,
    "should serialize undefined to null pointer",
  );
  assertEquals(
    $string.serialize(""),
    encoder.encode("\0"),
    "should serialize empty string to \\0-ended string",
  );

  assertEquals(
    $string.serialize(hello_world),
    encoder.encode(hello_world + "\0"),
    "should be serialize other strings into C-strings",
  );

  /** deserialize */
  assertEquals(
    $string.deserialize(null),
    null,
    "should deserialize null pointer to null",
  );

  const empty_string = new Uint8Array([0]);
  assertEquals(
    $string.deserialize(Deno.UnsafePointer.of(empty_string)),
    "",
    "should deserialize empty string",
  );

  assertEquals(
    $string.deserialize(
      Deno.UnsafePointer.of(encoder.encode(hello_world + "\0")),
    ),
    hello_world,
    "should deserialize C-strings to strings",
  );
});

Deno.test("$bool", () => {
  assertEquals($bool.symbol, "i32");
  assertEquals($bool.size, 4);

  const TRUTHY = [
    true,
    {},
    [],
    42,
    "0",
    "false",
    new Date(),
    -42,
    12n,
    3.14,
    -3.14,
    Infinity,
    -Infinity,
  ];

  const FALSY = [
    false,
    null,
    undefined,
    0,
    -0,
    0n,
    NaN,
    "",
  ];

  /** serialize */
  for (const value of TRUTHY) {
    assertEquals(
      $bool.serialize(value as boolean),
      1,
      `should serialize truthy value ${value} to 1`,
    );
  }

  for (const value of FALSY) {
    assertEquals(
      $bool.serialize(value as boolean),
      0,
      `should serialize falsy value ${value} to 0`,
    );
  }

  /** deserialize */
  assertEquals(
    $bool.deserialize(1),
    true,
    "should deserialize 1 to true",
  );
  assertEquals(
    $bool.deserialize(123),
    true,
    "should deserialize non-zero values to true",
  );
  assertEquals(
    $bool.deserialize(0),
    false,
    "should deserialize zero to false",
  );
});

Deno.test("$i32", () => {
  assertEquals($i32.symbol, "i32");
  assertEquals($i32.size, 4);

  // TODO: should throw if out-of-range numbers are given (or clamp them)
  assertEquals(
    $i32.serialize(12),
    12,
    "should get serialized into i32",
  );
  assertEquals(
    $i32.deserialize(12),
    12,
    "should be deserialized into i32",
  );
});

Deno.test("$u32", () => {
  assertEquals($u32.symbol, "u32");
  assertEquals($u32.size, 4);

  // TODO: should throw if out-of-range numbers are given (or clamp them)
  // TODO: should check if number is really unsigned
  assertEquals(
    $u32.serialize(12),
    12,
    "should get serialized into u32",
  );
  assertEquals(
    $u32.deserialize(12),
    12,
    "should be deserialized into u32",
  );
});

Deno.test("$i8", () => {
  assertEquals($i8.symbol, "i8");
  assertEquals($i8.size, 1);

  // TODO: should throw if out-of-range numbers are given (or clamp them)
  assertEquals(
    $i8.serialize(12),
    12,
    "should get serialized into i8",
  );
  assertEquals(
    $i8.deserialize(12),
    12,
    "should be deserialized into i8",
  );
});

Deno.test("$u8", () => {
  assertEquals($u8.symbol, "u8");
  assertEquals($u8.size, 1);

  // TODO: should throw if out-of-range numbers are given (or clamp them)
  // TODO: should check if number is really unsigned
  assertEquals(
    $u8.serialize(12),
    12,
    "should get serialized into u8",
  );
  assertEquals(
    $u8.deserialize(12),
    12,
    "should be deserialized into u8",
  );
});

Deno.test("$i64", () => {
  assertEquals($i64.symbol, "i64");
  assertEquals($i64.size, 8);

  // TODO: should throw if out-of-range numbers are given (or clamp them)
  assertEquals(
    $i64.serialize(12),
    12n,
    "numbers should get serialized into BigInts",
  );
  assertEquals(
    $i64.serialize(-64444444444444444444444444444444n),
    -64444444444444444444444444444444n,
    "BigInt should get passed through",
  );
  assertEquals(
    $i64.deserialize(12),
    12n,
    "numbers should get deserialized into BigInts",
  );
  assertEquals(
    $i64.deserialize(-64444444444444444444444444444444n),
    -64444444444444444444444444444444n,
    "BigInt should get deserialized",
  );
});

Deno.test("$u64", () => {
  assertEquals($u64.symbol, "u64");
  assertEquals($u64.size, 8);

  // TODO: should throw if out-of-range numbers are given (or clamp them)
  // TODO: should check if number is really unsigned
  assertEquals(
    $u64.serialize(12),
    12n,
    "numbers should get serialized into BigInts",
  );
  assertEquals(
    $u64.serialize(64444444444444444444444444444444n),
    64444444444444444444444444444444n,
    "BigInt should get passed through",
  );
  assertEquals(
    $u64.deserialize(12),
    12n,
    "numbers should get deserialized into BigInts",
  );
  assertEquals(
    $u64.deserialize(64444444444444444444444444444444n),
    64444444444444444444444444444444n,
    "BigInt should get deserialized",
  );
});

Deno.test("$f32", () => {
  assertEquals($f32.symbol, "f32");
  assertEquals($f32.size, 4);

  // TODO: should throw if out-of-range numbers are given (or clamp them)
  assertEquals(
    $f32.serialize(12),
    12,
    "numbers should get serialized into f32",
  );
  assertEquals(
    $f32.deserialize(12),
    12,
    "f32 should get deserialized into numbers",
  );
});

Deno.test("$f64", () => {
  assertEquals($f64.symbol, "f64");
  assertEquals($f64.size, 8);

  assertEquals(
    $f64.serialize(12),
    12n,
    "numbers should get serialized into BigInts",
  );
  assertEquals(
    $f64.serialize(64444444444444444444444444444444n),
    64444444444444444444444444444444n,
    "BigInt should get passed through",
  );
  assertEquals(
    $f64.deserialize(12),
    12n,
    "numbers should get deserialized into BigInts",
  );
  assertEquals(
    $f64.deserialize(64444444444444444444444444444444n),
    64444444444444444444444444444444n,
    "BigInt should get deserialized",
  );
});
