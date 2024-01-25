import { cast_u64_ptr, deref_str } from "./base_utils/convert.ts";
import g from "./bindings/mod.js";
import handleInfo from "./handleInfo.js";
import { hasOverride, loadOverride } from "./overrides/mod.ts";
import { peek_ptr } from "./base_utils/convert.ts";

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
    const pointer = peek_ptr(version);

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
  // if no version is specified, the latest
  if (!version) {
    version = getLatestVersion(namespace);
  }

  const repo = load(namespace, version);

  loadDependencies(namespace, version);

  return repo;
}

function load(namespace, version) {
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
      message = deref_str(peek_ptr(cast_u64_ptr(error[0]), 8));
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

function loadDependencies(namespace) {
  const dependencies = get_cstr_array(
    g.irepository.get_dependencies(null, namespace),
  );

  for (const dependency of dependencies) {
    const [namespace, version] = dependency.split("-");

    // only load dependencies that have overrides, as it saves time
    // otherwise they will be loaded when required
    if (hasOverride(namespace, version)) {
      load(namespace, version);
    }
  }
}

function get_cstr_array(pointer) {
  const strings = [];

  for (let i = 0; true; i++) {
    const str = deref_str(peek_ptr(pointer, i * 8));
    if (!str) break;
    strings.push(str);
  }

  return strings;
}
