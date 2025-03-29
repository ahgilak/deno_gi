import {GIInfoType, GType} from "../bindings/enums.ts";
import g from "../bindings/mod.js";
import {createEnum} from "../types/enum.ts";
import {createInterface} from "../types/interface.js";
import {createObject} from "../types/object.js";
import {createStruct} from "../types/struct.js";

export const cache = new Map();

// find the closest registed parent type. sometimes gTypes may not be visible
// in gobject-introspection for one of two reasons: 1. they were registered
// as by the user as a static type or 2. the namespace they are in is not
// loaded.
function getBaseGType(gType) {
    if (!g.type.is_a(gType, GType.OBJECT)) return gType;

    let baseGType = gType;
    while (!g.irepository.find_by_gtype(null, baseGType)) {
        baseGType = g.type.parent(baseGType);
    }

    return baseGType;
}

export function objectByGType(_gType) {
    const gType = getBaseGType(_gType);

    if (cache.has(gType)) {
        return cache.get(gType);
    }

    const info = g.irepository.find_by_gtype(null, gType);

    if (!info) {
        throw new Error(
            `Could not find GObjectInfo for ${_gType}. Is it a valid registered type?`,
        );
    }

    const result = createGObject(info, gType);
    Object.freeze(result);
    cache.set(gType, result);
    g.base_info.unref(info);
    return result;
}

export function objectByInfo(info) {
    const gType = g.registered_type_info.get_g_type(info);

    // TODO: 4n is actually G_TYPE_VOID
    if (gType !== 4n && cache.has(gType)) {
        return cache.get(gType);
    }

    const result = createGObject(info, gType);
    Object.freeze(result);
    cache.set(gType, result);
    return result;
}

function createGObject(info, gType) {
    const type = g.base_info.get_type(info);

    switch (type) {
        case GIInfoType.ENUM:
        case GIInfoType.FLAGS:
            return createEnum(info);

        case GIInfoType.OBJECT:
            return createObject(info, gType);

        case GIInfoType.INTERFACE:
            return createInterface(info, gType);

        case GIInfoType.STRUCT:
            return createStruct(info, gType);
    }
}
