import g from "./bindings/mod.ts";
import handleInfo from "./handleInfo.js";

export function require(namespace: string, version: string | null) {
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

  return repo;
}
