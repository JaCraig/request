import { InMemoryStorageProvider } from "../src/InMemoryStorageProvider";
import { CacheEntryOptions } from "../src/CacheEntryOptions";

describe("InMemoryStorageProvider", () => {
  let storageProvider: InMemoryStorageProvider;

  beforeEach(() => {
    storageProvider = new InMemoryStorageProvider();
  });

  afterEach(() => {
    storageProvider.clear();
  });

  it("should add an object to the storage provider", async () => {
    const obj = { name: "John Doe", age: 30 };
    const key = "key1";
    const options: CacheEntryOptions = { expirationTime: 0, sliding: false, slidingExpirationTime: 0 };

    await storageProvider.add(obj, key, options);

    const result = await storageProvider.get(key);
    expect(result).toEqual(obj);
  });

  it("should remove an object from the storage provider", async () => {
    const obj = { name: "John Doe", age: 30 };
    const key = "key1";
    const options: CacheEntryOptions = { expirationTime: 0, sliding: false, slidingExpirationTime: 0 };

    await storageProvider.add(obj, key, options);
    await storageProvider.remove(key);

    const result = await storageProvider.get(key);
    expect(result).toBeUndefined();
  });

  it("should get an object from the storage provider by key", async () => {
    const obj = { name: "John Doe", age: 30 };
    const key = "key1";
    const options: CacheEntryOptions = { expirationTime: 0, sliding: false, slidingExpirationTime: 0 };

    await storageProvider.add(obj, key, options);

    const result = await storageProvider.get(key);
    expect(result).toEqual(obj);
  });

  it("should get or create an object in the storage provider", async () => {
    const key = "key1";
    const options: CacheEntryOptions = { expirationTime: 0, sliding: false, slidingExpirationTime: 0 };

    const fallBack = async () => {
      return { name: "John Doe", age: 30 };
    };

    const result = await storageProvider.getOrCreate(key, fallBack, options);
    expect(result).toEqual({ name: "John Doe", age: 30 });
  });

  it("should get the options for an object in the storage provider by key", async () => {
    const obj = { name: "John Doe", age: 30 };
    const key = "key1";
    const options: CacheEntryOptions = { expirationTime: 0, sliding: false, slidingExpirationTime: 0 };

    await storageProvider.add(obj, key, options);

    const result = await storageProvider.getOptions(key);
    expect(result).toEqual(options);
  });

  it("should compact the storage provider and remove expired items", async () => {
    const obj1 = { name: "John Doe", age: 30 };
    const key1 = "key1";
    const options1: CacheEntryOptions = { expirationTime: 0, sliding: false, slidingExpirationTime: 0 };

    const obj2 = { name: "Jane Smith", age: 25 };
    const key2 = "key2";
    const options2: CacheEntryOptions = { expirationTime: new Date().getTime() + 1000, sliding: false, slidingExpirationTime: 0 };

    await storageProvider.add(obj1, key1, options1);
    await storageProvider.add(obj2, key2, options2);

    await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait for expiration

    await storageProvider.compact();

    const result1 = await storageProvider.get(key1);
    const result2 = await storageProvider.get(key2);

    expect(result1).toEqual(obj1);
    expect(result2).toBeUndefined();
  });

  it("should clear the storage provider of all items", async () => {
    const obj = { name: "John Doe", age: 30 };
    const key = "key1";
    const options: CacheEntryOptions = { expirationTime: 0, sliding: false, slidingExpirationTime: 0 };

    await storageProvider.add(obj, key, options);
    await storageProvider.clear();

    const result = await storageProvider.get(key);
    expect(result).toBeUndefined();
  });
});