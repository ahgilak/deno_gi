import * as GObject from "./GObject.ts";

export interface GIOverride {
  name: string;
  version: string;
  // deno-lint-ignore no-explicit-any
  module: any;
}

export const overrides: GIOverride[] = [
  { name: "GObject", version: "2.0", module: GObject },
];

export function loadOverride(namespace: string, repo: unknown) {
  const override = overrides.find((override) => {
    return override.name === namespace;
  });

  if (override) {
    override.module._init(repo);
  }
}
