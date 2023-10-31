import g from "../bindings/mod.js";
import { getName } from "../utils/string.ts";
import { handleCallable } from "./callable.js";
import { handleSignal } from "./signal.js";

function defineMethods(target, info) {
  const nMethods = g.interface_info.get_n_methods(info);

  for (let i = 0; i < nMethods; i++) {
    const methodInfo = g.interface_info.get_method(info, i);
    handleCallable(target, methodInfo);
  }
}

function defineSignals(target, info) {
  const nSignals = g.interface_info.get_n_signals(info);

  for (let i = 0; i < nSignals; i++) {
    const signalInfo = g.interface_info.get_signal(info, i);
    handleSignal(target, signalInfo);
  }
}

export function createInterface(info) {
  const ObjectClass = class {};

  Object.defineProperty(ObjectClass, "name", {
    value: getName(info),
  });

  defineMethods(ObjectClass, info);
  defineSignals(ObjectClass, info);
  return ObjectClass;
}
