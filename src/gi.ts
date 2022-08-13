import GIRepository from "./bindings/gobject-introspection/symbols.ts";
import { getName, toCString } from "./utils.ts";
import handleInfo from "./handleInfo.ts";

const repository = GIRepository.g_irepository_get_default();

export function require(namespace: string, version?: string) {
  const result = new Object();

  const namespace_ = toCString(namespace);
  const version_ = version ? toCString(version) : null;

  GIRepository.g_irepository_require(
    repository,
    namespace_,
    version_,
    0, // disable lazy load
    null,
  );

  const nInfos = GIRepository.g_irepository_get_n_infos(
    repository,
    namespace_,
  );

  for (let i = 0; i < nInfos; i++) {
    const info = GIRepository.g_irepository_get_info(
      repository,
      namespace_,
      i,
    );

    Object.defineProperty(result, getName(info), {
      value: handleInfo(info),
    });

    GIRepository.g_base_info_unref(info);
  }

  return Object.freeze(result);
}
