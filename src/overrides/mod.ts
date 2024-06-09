import * as GObject from "./GObject.ts";
import * as GLib from "./GLib.ts";

export interface GIOverride {
  name: string;
  version: string;
  // deno-lint-ignore no-explicit-any
  module: any;
}

export const overrides: GIOverride[] = [
  { name: "GObject", version: "2.0", module: GObject },
  { name: "GLib", version: "2.0", module: GLib },
];

export function hasOverride(namespace: string, version: string) {
  return overrides.some((override) => {
    return override.name === namespace && override.version === version;
  });
}

export function loadOverride(namespace: string, repo: unknown) {
  const override = overrides.find((override) => {
    return override.name === namespace;
  });

  if (override) {
    override.module._init(repo);
  }
}
