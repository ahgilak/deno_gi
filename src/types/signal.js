import { getName } from "../utils/string.ts";

export function handleSignal(target, info) {
  const name = getName(info);
  Reflect.defineMetadata("gi:signals", info, target, name);
}
