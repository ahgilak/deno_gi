import { getName } from "../utils/string.ts";

export function handleSignal(target: object, info: Deno.PointerValue) {
  const name = getName(info);
  Reflect.defineMetadata("gi:signals", info, target, name);
}
