import {createType, TypedArray} from "./ffipp.ts";

const encoder = new TextEncoder();

export const $pointer = createType({
  symbol: "pointer",
  size: 8,
  serialize: (value: Deno.PointerValue) => value,
  deserialize: (value: Deno.PointerValue) => value,
});

export const $buffer = createType({
  symbol: "buffer",
  size: 8,
  serialize: (value: TypedArray) => value,
  deserialize: (value: Deno.PointerValue) => value,
});

export const $void = createType({
  symbol: "void",
  size: 0,
  serialize: () => undefined,
  deserialize: () => undefined,
});

export const $string = createType({
  symbol: "buffer",
  size: 8,
  // empty string converts to a pointer to zero value, but null and undefined convert to null pointer.
  serialize: (value: string | null) => value == null ? null : encoder.encode(value + "\0"),
  deserialize: (value: Deno.PointerValue) => value ? Deno.UnsafePointerView.getCString(value) : null,
});

export const $bool = createType<boolean, boolean, number, number>({
  symbol: "i32",
  size: 4,
  serialize: (value: boolean) => (value ? 1 : 0),
  deserialize: (value: number) => value !== 0,
});

export const $i32 = createType({
  symbol: "i32",
  size: 4,
  serialize: (value: number) => value,
  deserialize: (value: number) => value,
});

export const $u32 = createType({
  symbol: "u32",
  size: 4,
  serialize: (value: number) => value,
  deserialize: (value: number) => value,
});

export const $i8 = createType({
  symbol: "i8",
  size: 1,
  serialize: (value: number) => value,
  deserialize: (value: number) => value,
});

export const $u8 = createType({
  symbol: "u8",
  size: 1,
  serialize: (value: number) => value,
  deserialize: (value: number) => value,
});

export const $i64 = createType({
  symbol: "i64",
  size: 8,
  serialize: (value: number | bigint) => BigInt(value),
  deserialize: (value: unknown) => BigInt(value as number | bigint) as bigint,
});

export const $u64 = createType({
  symbol: "u64",
  size: 8,
  serialize: (value: number | bigint) => BigInt(value),
  deserialize: (value: number | bigint) => BigInt(value),
});

export const $f32 = createType({
  symbol: "f32",
  size: 4,
  serialize: (value: number) => value,
  deserialize: (value: number) => value,
});

export const $f64 = createType({
  symbol: "f64",
  size: 8,
  serialize: (value: number | bigint) => BigInt(value),
  deserialize: (value: number | bigint) => BigInt(value),
});
