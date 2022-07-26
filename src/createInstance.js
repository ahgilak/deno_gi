import GIRepository from "./bindings/gobject-introspection/girepository.js";
import { createObjectInstance } from "./types/object.js";
import { createStructInstance } from "./types/struct.js";

function createInstance(info, ref) {
  const type = GIRepository.g_base_info_get_type(info);

  switch (type) {
    case GIRepository.GIInfoType.GI_INFO_TYPE_OBJECT:
      return createObjectInstance(info, ref);
    case GIRepository.GIInfoType.GI_INFO_TYPE_STRUCT:
      return createStructInstance(info, ref);
  }
}

export default createInstance;
