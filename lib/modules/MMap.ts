/* eslint-disable @typescript-eslint/no-explicit-any */
class MMap<K, V> extends Map<K, V> {
  constructor(init?: [K, V][] | Record<string | number | symbol, V>) {
    super();
    if (Array.isArray(init)) {
      for (const [key, value] of init) {
        this.set(key, value);
      }
    } else if (init && typeof init === 'object') {
      for (const [key, value] of Object.entries(init)) {
        this.set(key as unknown as K, value);
      }
    }
  }

  // Unique array keys by stringifying them
  set(key: K, value: V): this {
    const uniqueKey =
      typeof key === 'object' ? (JSON.stringify(key) as unknown as K) : key;
    return super.set(uniqueKey, value);
  }

  // Get
  get(key: K) {
    const uniqueKey =
      typeof key === 'object' ? (JSON.stringify(key) as unknown as K) : key;
    return super.get(uniqueKey);
  }

  // Filter values by predicate function
  filter(predicate: (value: V, key: K) => boolean): MMap<K, V> {
    const newMap = this.clone();

    for (const [key, value] of this) {
      if (!predicate(value, key)) {
        newMap.delete(key);
      }
    }

    return newMap;
  }

  // Adding to the ExtendedMap class
  diff(otherMap: MMap<K, V>) {
    const diffResult = new MMap<K, V>();

    // Check what's unique in this map
    for (const [key, value] of this) {
      if (!otherMap.has(key)) {
        diffResult.set(key, value);
      }
    }

    // Check what's unique in the other map
    for (const [key, value] of otherMap) {
      if (!this.has(key)) {
        diffResult.set(key, value);
      }
    }

    return diffResult;
  }

  // Enhanced iteration: Perform a function on each key-value pair
  forEachEnhanced(callback: (value: V, key: K, map: MMap<K, V>) => void): void {
    for (const [key, value] of this) {
      callback(value, key, this);
    }
  }

  // Convert to plain object
  toObject(): Record<string | number | symbol, V> {
    const obj: Record<string | number | symbol, V> = {};
    for (const [key, value] of this) {
      const strKey =
        typeof key === 'object' ? JSON.stringify(key) : String(key);
      obj[strKey] = value;
    }
    return obj;
  }

  // Initialize from plain object
  static fromObject(obj: Record<string | number | symbol, any>) {
    const newMap = new MMap();
    for (const [key, value] of Object.entries(obj)) {
      newMap.set(key, value);
    }
    return newMap;
  }

  // Merges another map or object into the current ExtendedMap
  merge(
    obj: Record<string | number | symbol, any> | Map<K, V> | MMap<K, V>,
    overwrite: boolean = true
  ) {
    if (obj instanceof Map || obj instanceof MMap) {
      for (const [key, value] of obj) {
        overwrite ? this.set(key, value) : this.update(key, value);
      }
    } else if (typeof obj === 'object') {
      for (const [key, value] of Object.entries(obj)) {
        const strKey =
          typeof key === 'object'
            ? (JSON.stringify(key) as K)
            : (String(key) as K);
        overwrite ? this.set(strKey, value) : this.update(strKey, value);
      }
    }
  }

  clone(): MMap<K, V> {
    const newMap = new MMap<K, V>();
    for (const [key, value] of this) {
      newMap.set(key, value);
    }
    return newMap;
  }

  update(key: K, value: V): boolean {
    if (!this.has(key)) {
      this.set(key, value);
      return true; // Successfully added
    }
    return false; // Key already exists, so no add
  }
}

export default MMap;
