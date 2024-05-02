// deno-lint-ignore-file no-explicit-any
import { GConnectFlags } from "../bindings/enums.js";
import g from "../bindings/mod.js";
import { createCallback } from "../types/callback.js";
import { cast_buf_ptr, deref_buf } from "../base_utils/convert.ts";
import { _setHydratingObject, ConstructContext } from "../types/object.js";
import { ExtendedDataView } from "../utils/dataview.js";

import type IGObject from "npm:@girs/gobject-2.0";

type Handler = (...args: unknown[]) => unknown;

function addObjectMethods(object: any) {
  object.prototype.connect = function (
    action: string,
    callback: Handler,
  ) {
    const signalInfo = Reflect.getMetadata(
      "gi:signals",
      this.constructor,
      action.split("::")[0],
    );

    const cb = createCallback(signalInfo, callback, this);
    const handler = g.signal.connect_data(
      Reflect.getOwnMetadata("gi:ref", this),
      action,
      cb.pointer,
      null,
      null,
      GConnectFlags.SWAPPED,
    );

    return handler;
  };

  object.prototype.on = function (
    action: string,
    callback: Handler,
  ) {
    return this.connect(action, callback);
  };

  object.prototype.once = function (
    action: string,
    callback: Handler,
  ) {
    const handler = this.connect(action, (...args: unknown[]) => {
      callback(...args);
      this.off(handler);
    });

    return handler;
  };

  object.prototype.off = function (handler: Handler) {
    g.signal.handler_disconnect(
      Reflect.getOwnMetadata("gi:ref", this),
      handler as any,
    );
  };

  object.prototype.emit = function (action: string) {
    g.signal.emit_by_name(
      Reflect.getOwnMetadata("gi:ref", this),
      action,
    );
  };
}

function getInterfaceGTypes(ifaces: object[]) {
  return ifaces.map((iface) => {
    const gType = Reflect.getOwnMetadata("gi:gtype", iface);

    if (!gType) {
      throw new Error(
        `Error while registering class: interface ${iface} doesn't have a gtype`,
      );
    }

    // TODO: actually check if iface is a GObject interface (using g.type_is_a maybe)

    return gType;
  });
}

function addInterfaces(instance_gtype: bigint, interfaces: object[]) {
  const interface_gtypes = getInterfaceGTypes(interfaces);
  interface_gtypes.forEach((ifaceGtype) => {
    // empty struct
    const vtable = new BigUint64Array(3);
    g.type.add_interface_static(
      instance_gtype,
      ifaceGtype,
      cast_buf_ptr(vtable),
    );
  });
}

function inheritInterfaces(target: any, ifaces: any[]) {
  for (const iface of ifaces) {
    for (const key of Object.keys(iface.prototype)) {
      if (Object.hasOwn(target.prototype, key)) {
        continue;
      }

      Object.defineProperty(
        target.prototype,
        key,
        Object.getOwnPropertyDescriptor(iface.prototype, key)!,
      );
    }
  }
}

function registerObjectClass(this: any) {
  const metaInfo = Reflect.getOwnMetadata("gi:metaInfo", this) as Metadata;

  const gtypename = metaInfo.GTypeName as string;
  const gflags = metaInfo.GTypeFlags ?? 0;
  const interfaces = metaInfo.Interfaces ?? [];

  const parent = Object.getPrototypeOf(this);

  const parentGtype = Reflect.getOwnMetadata("gi:gtype", parent);

  const query = GObject.typeQuery(parentGtype);

  const typeInfo = new GObject.TypeInfo();

  typeInfo.instance_init = (instance?: any, klass?: any) => {
    const klassPointer = Reflect.getOwnMetadata("gi:ref", klass);
    const gType = new ExtendedDataView(deref_buf(klassPointer, 8))
      .getBigUint64();

    Object.setPrototypeOf(instance, this.prototype);

    // only call the init function if we are NOT constructing from JS (i.e from Builder)
    if (ConstructContext[ConstructContext.length - 1] !== gType) {
      // this GObject doesn't have a JS object associated with it
      // so we need to create one
      _setHydratingObject(Reflect.getOwnMetadata("gi:ref", instance));
      new this();
    }
  };
  typeInfo.class_size = query.class_size;
  typeInfo.instance_size = query.instance_size;

  const gtype = GObject.typeRegisterStatic(
    parentGtype,
    gtypename,
    typeInfo,
    gflags,
  );

  // register interfaces
  // TODO: check if the class actually implements the interface
  addInterfaces(gtype, interfaces);
  inheritInterfaces(this, interfaces as any);

  Reflect.defineMetadata("gi:gtype", gtype, this);
}

export interface SignalDefinition {
  /** Emission Behavior */
  flags?: IGObject.SignalFlags;
  /** List of Parameters */
  param_types?: IGObject.GType[];
  /** Return type of callbacks */
  return_type?: IGObject.GType;
  /** Return type behavior */
  accumulator?: IGObject.SignalAccumulator;
}

/**
 * The definition of a GObject class.
 */
export interface Metadata {
  GTypeName: string;
  GTypeFlags?: IGObject.TypeFlags;
  Interfaces?: IGObject.TypeInterface[];
  Properties?: Record<string, IGObject.ParamSpec>;
  Signals?: Record<string, SignalDefinition>;
  Template?: string;
  /** Gtk Template children */
  Children?: string[];
  /** Gtk Template internal children */
  InternalChildren?: string[];
  /** Gtk CSS name */
  CssName?: string;
}

export function registerClass(
  metaInfo: Metadata,
  klass: typeof GObject.Object,
) {
  const registerClass = Reflect.getMetadata("gi:registerClass", klass);

  Reflect.defineMetadata("gi:metaInfo", metaInfo, klass);

  registerClass.call(klass);
}

let GObject: any = null;

export function _init(_GObject: any) {
  GObject = _GObject;

  addObjectMethods(GObject.Object);
  GObject.registerClass = registerClass;
  Reflect.defineMetadata(
    "gi:registerClass",
    registerObjectClass,
    GObject.Object,
  );
}
