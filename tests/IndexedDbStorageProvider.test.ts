import { IndexedDbStorageProvider } from "../src/IndexedDbStorageProvider";
import { CacheEntryOptions } from "../src/CacheEntryOptions";

describe("IndexedDbStorageProvider", () => {
  let storageProvider: IndexedDbStorageProvider;

  beforeEach(() => {
    storageProvider = new IndexedDbStorageProvider();
  });

  afterEach(async () => {
    await storageProvider.clear();
  });

  it("should add an object to the database", async () => {
    const obj = { name: "John Doe", age: 30 };
    const key = "user";
    const options: CacheEntryOptions = { expirationTime: 0, sliding: false, slidingExpirationTime: 0 };

    await storageProvider.add(obj, key, options);

    const result = await storageProvider.get(key);
    expect(result).toEqual(obj);
  });

  it("should remove an object from the database", async () => {
    const obj = { name: "John Doe", age: 30 };
    const key = "user";
    const options: CacheEntryOptions = { expirationTime: 0, sliding: false, slidingExpirationTime: 0  };

    await storageProvider.add(obj, key, options);
    await storageProvider.remove(key);

    const result = await storageProvider.get(key);
    expect(result).toBeUndefined();
  });

  it("should get the options for an object in the database", async () => {
    const obj = { name: "John Doe", age: 30 };
    const key = "user";
    const options: CacheEntryOptions = { expirationTime: 0, sliding: false, slidingExpirationTime: 0  };

    await storageProvider.add(obj, key, options);

    const result = await storageProvider.getOptions(key);
    expect(result).toEqual(options);
  });

  it("should get an object from the database by key", async () => {
    const obj = { name: "John Doe", age: 30 };
    const key = "user";
    const options: CacheEntryOptions = { expirationTime: 0, sliding: false, slidingExpirationTime: 0  };

    await storageProvider.add(obj, key, options);

    const result = await storageProvider.get(key);
    expect(result).toEqual(obj);
  });

  it("should get or create an object from the database", async () => {
    const key = "user";
    const options: CacheEntryOptions = { expirationTime: 0, sliding: false, slidingExpirationTime: 0  };

    const result = await storageProvider.getOrCreate(key, async () => {
      return { name: "John Doe", age: 30 };
    }, options);

    const result2 = await storageProvider.getOrCreate(key, async () => {
      return { name: "Jane Doe", age: 28 };
    }, options);

    expect(result).toEqual({ name: "John Doe", age: 30 });
    expect(result2).toEqual({ name: "John Doe", age: 30 });
  });

  it("should clear the database of all items and options", async () => {
    const obj = { name: "John Doe", age: 30 };
    const key = "user";
    const options: CacheEntryOptions = { expirationTime: 0, sliding: false, slidingExpirationTime: 0  };

    await storageProvider.add(obj, key, options);
    await storageProvider.clear();

    const result = await storageProvider.get(key);
    expect(result).toBeUndefined();
  });

  it("should compact the database and remove expired items", async () => {
    const obj1 = { name: "John Doe", age: 30 };
    const key1 = "user1";
    const options1: CacheEntryOptions = { expirationTime: 0, sliding: false, slidingExpirationTime: 0  };

    const obj2 = { name: "Jane Smith", age: 25 };
    const key2 = "user2";
    const options2: CacheEntryOptions = { expirationTime: new Date().getTime() - 1000, sliding: false, slidingExpirationTime: 0  };

    await storageProvider.add(obj1, key1, options1);
    await storageProvider.add(obj2, key2, options2);
    await storageProvider.compact();

    const result1 = await storageProvider.get(key1);
    const result2 = await storageProvider.get(key2);

    expect(result1).toEqual(obj1);
    expect(result2).toBeUndefined();
  });
});