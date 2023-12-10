import { cast_u64_ptr, deref_buf, deref_str } from "./base_utils/convert.ts";
import g from "./bindings/mod.js";
import handleInfo from "./handleInfo.js";
import { ExtendedDataView } from "./utils/dataview.js";
import { loadOverride } from "./overrides/mod.ts";

const repos = new Map();

function getLatestVersion(namespace) {
  if (g.irepository.is_registered(null, namespace, null)) {
    return g.irepository.get_version(null, namespace);
  }

  const versions = g.irepository.enumerate_versions(null, namespace);

  // No versions are available, require will throw an error
  if (!versions) return null;

  const array = [];

  for (let i = 0; i < g.slist.length(versions); i++) {
    const version = g.slist.nth(versions, i);
    const dataView = new ExtendedDataView(deref_buf(version, 8));
    const pointer = cast_u64_ptr(dataView.getBigUint64());

    array.push(deref_str(pointer));
  }

  if (array.length === 0) return null;

  if (array.length > 1) {
    console.warn(
      `Requiring ${namespace} but it has ${array.length} versions available. Specify version to pick one.`,
    );
  }

  return array
    .sort((a, b) => {
      return a.localeCompare(b, undefined, { numeric: true });
    })
    .reverse()[0];
}

/**
 * @param {string} namespace
 * @param {string?} version
 * @returns
 */
export function require(namespace, version) {
  if (!version) {
    version = getLatestVersion(namespace);
  }

  // if no version is specified, the latest
  const key = `${namespace}-${version}`;

  if (repos.has(key)) {
    return repos.get(key);
  }

  const error = new BigUint64Array(1);

  if (
    !g.irepository.require(
      null,
      namespace,
      version,
      0, // disable lazy load
      error,
    )
  ) {
    let message = "Unknown error";

    if (error) {
      const dataView = new ExtendedDataView(
        deref_buf(cast_u64_ptr(error[0]), 16),
      );
      message = deref_str(cast_u64_ptr(dataView.getBigUint64(8)));
    }

    const versionString = version ? ` version ${version}` : "";

    throw new Error(
      `Requiring ${namespace}${versionString} failed: ${message}`,
    );
  }

  const repo = new Object();

  const nInfos = g.irepository.get_n_infos(null, namespace);

  for (let i = 0; i < nInfos; i++) {
    const info = g.irepository.get_info(null, namespace, i);
    handleInfo(repo, info);
    g.base_info.unref(info);
  }

  loadOverride(namespace, repo);

  repos.set(key, repo);

  return repo;
}
