import GIRepository from "./bindings/gobject-introspection/symbols.ts";
import { GIInfoType } from "./bindings/gobject-introspection/enums.ts";

export function library(name: string, version: number | string) {
  switch (Deno.build.os) {
    case "darwin":
      return `lib${name}.${version}.dylib`;
    case "linux":
      return `lib${name}.so.${version}`;
    case "windows":
      return `lib${name}-${version}.dll`;
  }
}

export const isLittleEndian =
  (new Uint8Array(new Uint16Array([1]).buffer)[0] === 1);

export const encoder = new TextEncoder();

export class LocalDataView {
  #dataView: DataView;

  constructor(buffer: ArrayBufferLike);
  constructor(pointer: Deno.PointerValue, length: number);
  constructor(buffer: ArrayBufferLike | Deno.PointerValue, length: number = 0) {
    if (
      !(buffer instanceof ArrayBuffer ||
        buffer instanceof SharedArrayBuffer)
    ) {
      buffer = Deno.UnsafePointerView.getArrayBuffer(
        BigInt(buffer),
        length,
      );
    }

    this.#dataView = new DataView(buffer);
  }

  getUint8(offset = 0) {
    return this.#dataView.getUint8(offset);
  }

  getInt8(offset = 0) {
    return this.#dataView.getInt8(offset);
  }

  getUint16(offset = 0) {
    return this.#dataView.getUint16(offset, isLittleEndian);
  }

  getInt16(offset = 0) {
    return this.#dataView.getInt16(offset, isLittleEndian);
  }
  getUint32(offset = 0) {
    return this.#dataView.getUint32(offset, isLittleEndian);
  }
  getInt32(offset = 0) {
    return this.#dataView.getInt32(offset, isLittleEndian);
  }
  getBigUint64(offset = 0) {
    return this.#dataView.getBigUint64(offset, isLittleEndian);
  }
  getBigInt64(offset = 0) {
    return this.#dataView.getBigInt64(offset, isLittleEndian);
  }
  getFloat32(offset = 0) {
    return this.#dataView.getFloat32(offset, isLittleEndian);
  }
  getFloat64(offset = 0) {
    return this.#dataView.getFloat64(offset, isLittleEndian);
  }

  setUint8(value: number, offset = 0) {
    return this.#dataView.setUint8(value, offset);
  }

  setInt8(value: number, offset = 0) {
    return this.#dataView.setInt8(value, offset);
  }

  setUint16(value: number, offset = 0) {
    return this.#dataView.setUint16(offset, value, isLittleEndian);
  }

  setInt16(value: number, offset = 0) {
    return this.#dataView.setInt16(offset, value, isLittleEndian);
  }
  setUint32(value: number, offset = 0) {
    return this.#dataView.setUint32(offset, value, isLittleEndian);
  }
  setInt32(value: number, offset = 0) {
    return this.#dataView.setInt32(offset, value, isLittleEndian);
  }
  setBigUint64(value: number | bigint, offset = 0) {
    return this.#dataView.setBigUint64(offset, BigInt(value), isLittleEndian);
  }
  setBigInt64(value: number | bigint, offset = 0) {
    return this.#dataView.setBigInt64(offset, BigInt(value), isLittleEndian);
  }
  setFloat32(value: number, offset = 0) {
    return this.#dataView.setFloat32(offset, value, isLittleEndian);
  }
  setFloat64(value: number, offset = 0) {
    return this.#dataView.setFloat64(offset, value, isLittleEndian);
  }
}

export function toCString(text: string) {
  return encoder.encode(text + "\0");
}

export function fromCString(pointer: Deno.PointerValue, offset = 0) {
  return Deno.UnsafePointerView.getCString(BigInt(pointer), offset);
}

export function getName(info: Deno.PointerValue) {
  const namePtr = GIRepository.g_base_info_get_name(info);
  const nameStr = fromCString(namePtr);

  const type = GIRepository.g_base_info_get_type(info);

  const isCallableInfo = (type === GIInfoType.GI_INFO_TYPE_FUNCTION) ||
    (type === GIInfoType.GI_INFO_TYPE_CALLBACK) ||
    (type === GIInfoType.GI_INFO_TYPE_VFUNC);

  if (isCallableInfo) {
    return toCamelCase(nameStr);
  }

  return nameStr;
}

export function toSnakeCase(text: string) {
  return text.replaceAll(
    /[A-Z]/g,
    (s) => "_" + s.toLowerCase(),
  );
}

export function toKebabCase(text: string) {
  return text.replaceAll(
    /[A-Z]/g,
    (s) => "-" + s.toLowerCase(),
  );
}

export function toCamelCase(text: string) {
  return text.replaceAll(
    /[_-][a-z]/g,
    (s) => s.substring(1).toUpperCase(),
  );
}
