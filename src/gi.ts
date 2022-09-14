import GIRepository from "./bindings/gobject-introspection/symbols.ts";
import { getName, toCString } from "./utils/string.ts";
import handleInfo from "./handleInfo.ts";

export function require(namespace: string, version?: string) {
  const result = new Object();

  const namespace_ = toCString(namespace);
  const version_ = version ? toCString(version) : null;

  GIRepository.g_irepository_require(
    null,
    namespace_,
    version_,
    0, // disable lazy load
    null,
  );

  const nInfos = GIRepository.g_irepository_get_n_infos(
    null,
    namespace_,
  );

  for (let i = 0; i < nInfos; i++) {
    const info = GIRepository.g_irepository_get_info(null, namespace_, i);
    const name = getName(info);

    Object.defineProperty(result, name, {
      value: handleInfo(info),
    });

    GIRepository.g_base_info_unref(info);
  }

  return Object.freeze(result);
}
