import { assert, assertEquals } from "../../test_deps.ts";
import * as mod from "../../../src/base_utils/convert.ts";

const typedArray = new TextEncoder().encode("test\0");
const { buffer } = typedArray;
const pointer = Deno.UnsafePointer.of(buffer);
assert(pointer);

Deno.test("deref_buf", () => {
  const result = mod.deref_buf(pointer, typedArray.length);

  assert(result, "the buffer is null");
  assert(result instanceof ArrayBuffer, "the buffer is not an ArrayBuffer");
  assertEquals(
    result,
    buffer,
    "the buffer is not the same as the original ArrayBuffer",
  );
});

Deno.test("cast_ptr_u64", () => {
  const result = mod.cast_ptr_u64(pointer);

  assert(result, "pointer value is null");
  assert(typeof result === "bigint", "pointer value is not a bigint");
  assertEquals(
    result,
    BigInt(Deno.UnsafePointer.value(pointer)),
    "pointer value is not a pointer to the buffer",
  );
});

Deno.test("cast_u64_ptr", () => {
  const result = mod.cast_u64_ptr(10n);

  assert(result, "pointer is null");
  assertEquals(
    result.constructor,
    undefined,
    "pointer is not a Deno.UnsafePointer",
  );
  assertEquals(
    BigInt(Deno.UnsafePointer.value(result)),
    10n,
    "pointer does not point to the correct value",
  );
});

Deno.test("cast_buf_ptr", () => {
  const result = mod.cast_buf_ptr(typedArray);

  assert(result, "pointer is null");
  assertEquals(
    result.constructor,
    undefined,
    "pointer is not a Deno.UnsafePointer",
  );
  assertEquals(
    result,
    pointer,
    "pointer does not point to the correct value",
  );
});

Deno.test("ref_buf", () => {
  const result = mod.ref_buf(pointer);

  assert(result, "buffer is null");
  assert(result instanceof BigUint64Array, "buffer is not a BigUint64Array");
  assertEquals(
    result[0],
    BigInt(Deno.UnsafePointer.value(pointer)),
    "buffer does not contain the correct value",
  );
});

Deno.test("ref_ptr", () => {
  const result = mod.ref_ptr(pointer);

  assert(result, "pointer is null");
  assertEquals(
    result.constructor,
    undefined,
    "pointer is not a Deno.UnsafePointer",
  );
  assertEquals(
    result,
    pointer,
    "pointer does not point to the correct value",
  );
});

Deno.test("cast_str_buf", () => {
  const result = mod.cast_str_buf("test");

  assert(result, "buffer is null");
  assert(result instanceof Uint8Array, "buffer is not a Uint8Array");
  assertEquals(
    result,
    new TextEncoder().encode("test\0"),
    "buffer does not contain the correct value",
  );
});

Deno.test("deref_str", () => {
  const result = mod.deref_str(pointer);

  assert(result, "string is null");
  assert(typeof result === "string", "string is not a string");
  assertEquals(
    result,
    "test",
    "string does not contain the correct value",
  );
});
