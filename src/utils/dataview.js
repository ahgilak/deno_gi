export const isLittleEndian =
  new Uint8Array(new Uint16Array([1]).buffer)[0] === 1;

export class ExtendedDataView {
  /** @type {ArrayBufferLike} */
  buffer;
  /** @type {DataView} */
  #dataView;

  /**
   * @param {ArrayBufferLike} buffer
   * @param {number} [offset=0]
   */
  constructor(buffer, offset = 0) {
    this.buffer = buffer;
    this.#dataView = new DataView(buffer, offset);
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

  setUint8(value, offset = 0) {
    return this.#dataView.setUint8(offset, value);
  }

  setInt8(value, offset = 0) {
    return this.#dataView.setInt8(offset, value);
  }

  setUint16(value, offset = 0) {
    return this.#dataView.setUint16(offset, value, isLittleEndian);
  }

  setInt16(value, offset = 0) {
    return this.#dataView.setInt16(offset, value, isLittleEndian);
  }
  setUint32(value, offset = 0) {
    return this.#dataView.setUint32(offset, value, isLittleEndian);
  }
  setInt32(value, offset = 0) {
    return this.#dataView.setInt32(offset, value, isLittleEndian);
  }
  setBigUint64(value, offset = 0) {
    return this.#dataView.setBigUint64(offset, BigInt(value), isLittleEndian);
  }
  setBigInt64(value, offset = 0) {
    return this.#dataView.setBigInt64(offset, BigInt(value), isLittleEndian);
  }
  setFloat32(value, offset = 0) {
    return this.#dataView.setFloat32(offset, value, isLittleEndian);
  }
  setFloat64(value, offset = 0) {
    return this.#dataView.setFloat64(offset, value, isLittleEndian);
  }
}
