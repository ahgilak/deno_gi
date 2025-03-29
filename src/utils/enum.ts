export class Enum {
  public static keys<T extends object>(e: T) {
    return this.sliceEnum(e, "keys");
  }

  public static values<T extends object>(e: T) {
    return this.sliceEnum(e, "values");
  }

  public static entries<T extends object>(e: T) {
    return this.sliceEnum(e, "entries");
  }

  private static sliceEnum<T extends object>(
    e: T,
    method: "keys" | "values" | "entries",
  ) {
    const source = Object[method](e);
    return isNaN(Number(source[0])) ? source : source.slice(source.length / 2);
  }
}
