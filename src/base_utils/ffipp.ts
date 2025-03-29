import "https://esm.sh/reflect-metadata@0.2.2";

/**
 * Replaces the nested object types in a given type with their corresponding FFIFunc types
 */
type ReplaceNestedObjectType<T> = {
  [K in keyof T]: T[K] extends FFIFunc<infer R, infer A> ? (...args: { [a in keyof A]: ArgType<A[a]> }) => R
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

/**
 * Extracts the input type from a FFIPPType
 */
type ArgType<T> = T extends FFIPPType<infer I, infer _O> ? I : never;

/**
 * FFI Parameter type
 */
type FFIPPType<I, O> = {
  <A extends unknown[]>(
    ...args: { [a in keyof A]: FFIPPType<A[a], A[a]> }
  ): FFIFunc<O, typeof args>;
  symbol: string;
  size: number;
  serialize: (arg_0: I) => unknown;
  deserialize: (arg_0: unknown) => O;
};

/**
 * FFI Function type
 */
type FFIFunc<R, A extends FFIPPType<unknown, unknown>[]> = {
  parameters: A;
  result: R;
};

function isFFIFunc<R, A extends FFIPPType<unknown, unknown>[]>(
  value: Record<string, unknown> | unknown,
): value is FFIFunc<R, A> {
  return !!value &&
    typeof value === "object" &&
    "parameters" in value &&
    "result" in value &&
    Array.isArray(value.parameters);
}

function isFFIPPType<I, O>(
  value: Record<string, unknown> | unknown,
): value is FFIPPType<I, O> {
  return !!value &&
    typeof value === "function" &&
    "symbol" in value &&
    "size" in value &&
    "serialize" in value &&
    "deserialize" in value;
}

/**
 * Creates a new type with the given symbol, size, serialize, and deserialize functions.
 * @param symbol The symbol of the type
 * @param size The size of the type in bytes
 * @param serialize The function to serialize the type
 * @param deserialize The function to deserialize the type
 */
export function createType<I, O, Raw_I = O, Raw_O = I>({
  symbol,
  size,
  serialize = (value) => value,
  deserialize = (value) => value,
}: {
  symbol: string;
  size: number;
  serialize: (arg_0: I) => Raw_O;
  deserialize: (arg_0: Raw_I) => O;
}): FFIPPType<I, O> {
  function typeFn(...parameters: FFIPPType<I, O>[]) {
    return { result: typeFn, parameters };
  }

  return Object.assign(typeFn, {
    symbol,
    size,
    serialize,
    deserialize,
  }) as FFIPPType<I, O>;
}

/**
 * Opens a dynamic library and returns an object with the specified symbols.
 * @param filename The name of the library file
 * @param symbols The symbols to be used in the library
 * @param joiner The token used to join the symbols
 */
export function openLib<T extends Record<string, unknown>>(
  filename: string,
  symbols: T,
  joiner: string = "_",
): ReplaceNestedObjectType<T> {
  const dlopen_symbols: Deno.ForeignLibraryInterface = {};
  let lib: Deno.DynamicLibrary<Deno.ForeignLibraryInterface> | null = null;

  const apply = <U extends Record<string, unknown>>(obj: U, prefixes: string[] = []): ReplaceNestedObjectType<U> => {
    const result: Record<string, unknown> = {};

    for (const [key, val] of Object.entries(obj)) {
      const k = [...prefixes, key];

      if (isFFIFunc<FFIPPType<unknown, unknown>, FFIPPType<unknown, unknown>[]>(val)) {
        const funcDef = val;

        dlopen_symbols[k.join(joiner)] = {
          parameters: funcDef.parameters.map((p) => p.symbol as Deno.NativeType),
          result: funcDef.result.symbol as Deno.NativeType,
        };

        result[key] = (...params: unknown[]) => {
          if (lib === null) throw new Error("Library not loaded");

          const symbolName = k.join(joiner);
          const serializedParams = params.map((v, i) => funcDef.parameters[i].serialize(v));

          const nativeResult = (<(...args: unknown[]) => unknown> lib.symbols[symbolName])(...serializedParams);

          if (nativeResult === undefined) throw new Error(`Function ${symbolName} not found in library`);

          return funcDef.result.deserialize(nativeResult);
        };
      } else if (val && typeof val === "object" && !Array.isArray(val)) {
        result[key] = apply(val as Record<string, unknown>, k);
      }
    }

    return result as ReplaceNestedObjectType<U>;
  };

  const result = apply(symbols);
  lib = Deno.dlopen(filename, dlopen_symbols);

  return result;
}

export function libName(name: string, version: string | number): string {
  switch (Deno.build.os) {
    case "darwin":
      return `lib${name}.${version}.dylib`;
    case "windows":
      return `lib${name}-${version}.dll`;
    case "linux":
    default:
      return `lib${name}.so.${version}`;
  }
}
