import { createType, TypedArray } from "./ffipp.js";

const encoder = new TextEncoder();

export const $pointer = createType({
  symbol: "pointer",
  size: 8,
  serilize: (value: Deno.PointerValue) => value,
  deserilize: (value: Deno.PointerValue) => value,
});

export const $buffer = createType({
  symbol: "buffer",
  size: 8,
  serilize: (value: ArrayBuffer | ArrayBufferView) => value,
  deserilize: (value: Deno.PointerValue) => value,
});

export const $void = createType({
  symbol: "void",
  size: 0,
  serilize: () => undefined,
  deserilize: () => undefined,
});

export const $string = createType({
  symbol: "buffer",
  size: 8,
  serilize: (value: string) => encoder.encode(value + "\0"),
  deserilize: (value: Deno.PointerValue) =>
    value ? Deno.UnsafePointerView.getCString(value) : null,
});

export const $bool = createType({
  symbol: "i32",
  size: 4,
  serilize: (value: boolean) => (value ? 1 : 0),
  deserilize: (value) => value !== 0,
});

export const $i32 = createType({
  symbol: "i32",
  size: 4,
  serilize: (value: number) => value,
  deserilize: (value: number) => value,
});

export const $u32 = createType({
  symbol: "u32",
  size: 4,
  serilize: (value: number) => value,
  deserilize: (value: number) => value,
});

export const $i8 = createType({
  symbol: "i8",
  size: 1,
  serilize: (value: number) => value,
  deserilize: (value: number) => value,
});

export const $u8 = createType({
  symbol: "u8",
  size: 1,
  serilize: (value: number) => value,
  deserilize: (value: number) => value,
});

export const $i64 = createType({
  symbol: "i64",
  size: 8,
  serilize: (value: number | bigint) => BigInt(value),
  deserilize: (value: number | bigint) => BigInt(value),
});

export const $u64 = createType({
  symbol: "u64",
  size: 8,
  serilize: (value: number | bigint) => BigInt(value),
  deserilize: (value: number | bigint) => BigInt(value),
});

export const $f32 = createType({
  symbol: "f32",
  size: 4,
  serilize: (value: number) => value,
  deserilize: (value: number) => value,
});

export const $f64 = createType({
  symbol: "f64",
  size: 8,
  serilize: (value: number | bigint) => BigInt(value),
  deserilize: (value: number | bigint) => BigInt(value),
});
