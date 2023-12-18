import g from "./bindings/mod.js";
import handleInfo from "./handleInfo.js";

const repos = new Map();

/**
 * @param {string} namespace
 * @param {string?} version
 * @returns
 */
export function require(namespace, version) {
  if (repos.has(namespace)) {
    return repos.get(namespace);
  }

  const repo = new Object();

  g.irepository.require(
    null,
    namespace,
    version,
    0, // disable lazy load
    null,
  );

  const nInfos = g.irepository.get_n_infos(null, namespace);

  for (let i = 0; i < nInfos; i++) {
    const info = g.irepository.get_info(null, namespace, i);
    handleInfo(repo, info);
    g.base_info.unref(info);
  }

  repos.set(namespace, repo);

  return repo;
}
