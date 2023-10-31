type ReplaceNestedObjectType<T> = {
  [K in keyof T]: T[K] extends FFIFunc<infer R, infer A>
    ? (...args: { [a in keyof A]: ArgType<A[a]> }) => R
    : T[K] extends object ? ReplaceNestedObjectType<T[K]>
    : T[K];
};

export type TypedArray =
  | BigInt64Array
  | BigUint64Array
  | Int32Array
  | Uint32Array
  | Int16Array
  | Uint16Array
  | Int8Array
  | Uint8Array
  | Uint8ClampedArray
  | Float64Array
  | Float32Array;

type ArgType<T> = T extends FFIPPType<infer I, infer _O> ? I : never;

type FFIPPType<I, O> = {
  <A extends any[]>(
    ...args: { [a in keyof A]: FFIPPType<A[a], A[a]> }
  ): FFIFunc<O, typeof args>;
  symbol: string;
};

type FFIFunc<R, A extends FFIPPType<any, any>[]> = {
  parameters: A;
  result: R;
};

export function createType<I, O>(a: {
  symbol: string;
  size: number;
  serilize: (arg_0: I) => any;
  deserilize: (arg_0: any) => O;
}): FFIPPType<I, O>;

export function openLib<T>(
  filename: string,
  symbols: T,
  joiner?: string,
): ReplaceNestedObjectType<T>;

export function libName(name: string, version: string | number): string;
