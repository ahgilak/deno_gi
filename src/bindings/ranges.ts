import { GITypeTag } from "https://raw.githubusercontent.com/ahgilak/deno_gi/main/src/bindings/enums.js";

export const NumberRanges = {
  [GITypeTag.INT8]: [-128, 127],
  [GITypeTag.INT16]: [-32_768, 32_767],
  [GITypeTag.INT32]: [-2_147_483_648, 2_147_483_647],
  [GITypeTag.INT64]: [-9_223_372_036_854_775_808n, 9_223_372_036_854_775_807n],
  [GITypeTag.UINT8]: [0, 255],
  [GITypeTag.UINT16]: [0, 65_535],
  [GITypeTag.UINT32]: [0, 4_294_967_295],
  [GITypeTag.UINT64]: [0, 18_446_744_073_709_551_615n],
  // TODO: not sure about these, will probably not be precise
  [GITypeTag.FLOAT]: [-3.4e38, 3.4e38],
  [GITypeTag.DOUBLE]: [-1.8e308, 1.8e308],
  // not sure
  [GITypeTag.GTYPE]: [0, 18_446_744_073_709_551_615n],
};

export function ensure_number_range(
  type: number,
  value: number | bigint,
): void {
  const range = NumberRanges[type];
  if (!range) return;

  const [min, max] = range;
  if (value >= min && value <= max) return;

  const tag = Object.entries(GITypeTag)
    .find(([_, name]) => name === type)?.[0]?.toLowerCase() ?? "type";
  throw new RangeError(`value is out of range for ${tag}`);
}
