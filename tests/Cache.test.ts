import { Cache } from "../src/Cache";
import { InMemoryStorageProvider } from "../src/InMemoryStorageProvider";
import { CacheEntryOptions } from "../src/CacheEntryOptions";

describe("Cache", () => {
  let cache: Cache;
  let storageProvider: InMemoryStorageProvider;

  beforeEach(() => {
    storageProvider = new InMemoryStorageProvider();
    cache = new Cache(storageProvider);
  });

  afterEach(() => {
    storageProvider.clear();
  });

  it("should set an object in the cache", async () => {
    const key = "key1";
    const value = { name: "John Doe", age: 30 };
    const options: CacheEntryOptions = { expirationTime: 0, sliding: false, slidingExpirationTime: 0 };

    await cache.set(key, value, options);

    const result = await storageProvider.get(key);
    expect(result).toEqual(value);
  });

  it("should get an object from the cache by key", async () => {
    const key = "key1";
    const value = { name: "John Doe", age: 30 };
    const options: CacheEntryOptions = { expirationTime: 0, sliding: false, slidingExpirationTime: 0 };

    await storageProvider.add(value, key, options);

    const result = await cache.get(key);
    expect(result).toEqual(value);
  });

  it("should get or create an object in the cache", async () => {
    const key = "key1";
    const options: CacheEntryOptions = { expirationTime: 0, sliding: false, slidingExpirationTime: 0 };

    const fallBack = async () => {
      return { name: "John Doe", age: 30 };
    };

    const result = await cache.getOrCreate(key, fallBack, options);
    expect(result).toEqual({ name: "John Doe", age: 30 });
  });

  it("should remove an object from the cache", async () => {
    const key = "key1";
    const value = { name: "John Doe", age: 30 };
    const options: CacheEntryOptions = { expirationTime: 0, sliding: false, slidingExpirationTime: 0 };

    await storageProvider.add(value, key, options);
    await cache.remove(key);

    const result = await storageProvider.get(key);
    expect(result).toBeUndefined();
  });

  it("should clear the cache of all items", async () => {
    const key = "key1";
    const value = { name: "John Doe", age: 30 };
    const options: CacheEntryOptions = { expirationTime: 0, sliding: false, slidingExpirationTime: 0 };

    await storageProvider.add(value, key, options);
    await cache.clear();

    const result = await storageProvider.get(key);
    expect(result).toBeUndefined();
  });
});