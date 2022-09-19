export function getLibraryName(name: string, version: number | string) {
  switch (Deno.build.os) {
    case "darwin":
      return `lib${name}.${version}.dylib`;
    case "linux":
      return `lib${name}.so.${version}`;
    case "windows":
      return `lib${name}-${version}.dll`;
  }
}
