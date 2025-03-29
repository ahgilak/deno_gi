import {getTypeSize} from "../../../../src/types/argument/array.ts";
import {GITypeTag} from "../../../../src/bindings/enums.ts";
import {assertEquals} from "../../../test_deps.ts";
import {Enum} from "../../../../src/utils/enum.ts";

Deno.test("getTypeSize", () => {
  for (const [tag, value] of Enum.entries(GITypeTag)) {
    const result = getTypeSize(value);
    let expected: number;

    switch (value) {
      case GITypeTag.BOOLEAN:
        expected = 1 << 2;
        break;
      case GITypeTag.UINT8:
      case GITypeTag.INT8:
        expected = 1;
        break;
      case GITypeTag.UINT16:
      case GITypeTag.INT16:
        expected = 1 << 1;
        break;
      case GITypeTag.UINT32:
      case GITypeTag.INT32:
        expected = 1 << 2;
        break;
      case GITypeTag.UINT64:
      case GITypeTag.INT64:
        expected = 1 << 3;
        break;
      case GITypeTag.FLOAT:
        expected = 1 << 2;
        break;
      case GITypeTag.DOUBLE:
        expected = 1 << 3;
        break;
      default:
        // TODO: are we sure the rest have this value?
        expected = 1 << 3;
        break;
    }

    assertEquals(result, expected, `unexpected type size for ${tag}`);
  }
});

Deno.test("unboxArray", () => {
  // TODO: requires getting a paramType for an array
});

Deno.test("boxArray", () => {
  // TODO: requires getting a typeInfo for an array
});
