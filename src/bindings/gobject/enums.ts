export const GParamFlags = {
  READABLE: 1 << 0,
  WRITABLE: 1 << 1,
  READWRITE: 3,
  CONSTRUCT: 1 << 2,
  CONSTRUCT_ONLY: 1 << 3,
  LAX_VALIDATION: 1 << 4,
  STATIC_NAME: 1 << 5,
  STATIC_NICK: 1 << 6,
  STATIC_BLURB: 1 << 7,
  EXPLICIT_NOTIFY: 1 << 30,
  DEPRECATED: 1 << 31,
};
