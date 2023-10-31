import type { TypedArray } from "./ffipp.js";

const encoder = new TextEncoder();

export function deref_buf(
  value: Deno.PointerObject,
  size: number,
  offset?: number,
) {
  return Deno.UnsafePointerView.getArrayBuffer(value, size, offset);
}

export function cast_ptr_u64(value: Deno.PointerValue) {
  return BigInt(Deno.UnsafePointer.value(value));
}

export function cast_u64_ptr(value: bigint) {
  return Deno.UnsafePointer.create(value);
}

export function cast_buf_ptr(value: TypedArray) {
  return Deno.UnsafePointer.of(value);
}

export function ref_buf(value: Deno.PointerValue | bigint) {
  if (typeof value === "object") {
    value = cast_ptr_u64(value);
  }

  return new BigUint64Array([value]);
}

export function ref_ptr(value: Parameters<typeof ref_buf>[0]) {
  return cast_buf_ptr(ref_buf(value));
}

export function cast_str_buf(text: string) {
  return encoder.encode(text + "\0");
}

export function deref_str(pointer: Deno.PointerValue, offset = 0) {
  if (!pointer) return null;

  return Deno.UnsafePointerView.getCString(
    pointer,
    offset,
  );
}
