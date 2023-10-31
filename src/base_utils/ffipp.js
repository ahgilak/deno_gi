/// <reference types="./ffipp.d.ts"/>

import "npm:reflect-metadata";

export function createType({
  symbol,
  size,
  serilize = (value) => value,
  deserilize = (value) => value,
}) {
  const result = (...parameters) => ({ result, parameters });
  result.symbol = symbol;
  result.size = size;
  result.serilize = serilize;
  result.deserilize = deserilize;
  return result;
}

export function openLib(filename, symbols, joiner = "_") {
  /** @type {Deno.ForeignLibraryInterface} */
  const dlopen_symbols = {};

  /** @type {Deno.DynamicLibrary} */
  let lib = null;

  /**
   * @param {*} obj
   * @param {string[]} prefixes
   * @returns
   */
  const apply = (obj, prefixes = []) => {
    return Object.fromEntries(
      Object.entries(obj).map(([key, val]) => {
        const k = prefixes.concat([key]);
        if (val.result) {
          dlopen_symbols[k.join(joiner)] = {
            parameters: val.parameters.map((p) => p.symbol),
            result: val.result.symbol,
          };
          return [
            key,
            (...params) =>
              val.result.deserilize(
                lib.symbols[k.join(joiner)](
                  ...params.map((v, k) => val.parameters[k].serilize(v)),
                ),
              ),
          ];
        }

        return [key, apply(val, k, joiner)];
      }),
    );
  };

  const result = apply(symbols);
  lib = Deno.dlopen(filename, dlopen_symbols);

  return result;
}

export function libName(name, version) {
  switch (Deno.build.os) {
    case "darwin":
      return `lib${name}.${version}.dylib`;
    case "linux":
      return `lib${name}.so.${version}`;
    case "windows":
      return `lib${name}-${version}.dll`;
  }
}
