import {assert, assertEquals} from "../../test_deps.ts";
import * as mod from "../../../src/base_utils/ffipp.js";

Deno.test("createType", () => {
  const symbol = "test";
  const size = 1;
  const serilize = (arg_0: unknown) => arg_0;
  const deserilize = (arg_0: unknown) => arg_0;

  const result = mod.createType({
    symbol,
    size,
    serialize: serilize,
    deserialize: deserilize,
  });

  assert(result, "result is null");
  assertEquals(
    typeof result,
    "function",
    "result is not a function",
  );

  // deno-lint-ignore no-explicit-any
  const parameters = [1, 2, 3] as any;
  const instance = result(parameters);

  assert(instance, "instance is null");
  assertEquals(typeof instance, "object", "instance is not an object");
  assert(Object.hasOwn(instance, "result"), "instance has no result property");
  assert(
    Object.hasOwn(instance, "parameters"),
    "instance has no parameters property",
  );
  assertEquals(
    instance.parameters,
    [parameters],
    "instance.parameters is not the same as the original parameters",
  );
  assertEquals(
    instance.result,
    result,
    "instance.result is not the same as the original result",
  );
  // @ts-ignore symbol is a private property
  assertEquals(result.symbol, symbol, "result.symbol is not the same");
  // @ts-ignore symbol is a private property
  assertEquals(result.size, size, "result.size is not the same");
  // @ts-ignore symbol is a private property
  assertEquals(
    // @ts-ignore symbol is a private property
    result.serialize,
    serilize,
    "result.serilize is not the same",
  );
  assertEquals(
    // @ts-ignore symbol is a private property
    result.deserialize,
    deserilize,
    "result.deserilize is not the same",
  );
});

// TODO: test openLib

Deno.test("libName", () => {
  const name = "test";
  const version = 1;
  const result = mod.libName(name, version);

  // TODO: fake check every OS
  switch (Deno.build.os) {
    case "darwin":
      assertEquals(result, `lib${name}.${version}.dylib`);
      break;
    case "linux":
      assertEquals(result, `lib${name}.so.${version}`);
      break;
    case "windows":
      assertEquals(result, `lib${name}-${version}.dll`);
      break;
    default:
      throw new Error("Unsupported OS");
  }
});
