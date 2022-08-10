import GIRepository from "./bindings/gobject-introspection/girepository.js";
import { getName, toCString } from "./utils.js";
import handleInfo from "./handleInfo.js";

const repository = GIRepository.g_irepository_get_default();

/**
 * @param {string} namespace
 * @param {string?} version
 * @returns
 */
export function require(namespace, version) {
  const result = new Object();

  const namespace_ = toCString(namespace);
  const version_ = toCString(version);

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
