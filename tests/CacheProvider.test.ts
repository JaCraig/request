import { CacheProvider } from "../src/CacheProvider";
import { StorageProvider } from "../src/StorageProvider";
import { IndexedDbStorageProvider } from "../src/IndexedDbStorageProvider";
import { Cache } from "../src/Cache";

describe("CacheProvider", () => {

  it("should configure the cache with the specified storage provider", () => {
    const storageProvider: StorageProvider = new IndexedDbStorageProvider();
    const result = CacheProvider.configure("Default", storageProvider);

    expect(result).toBeDefined();
    expect(result!["Default"]).toBeInstanceOf(Cache);
  });

  it("should return the existing storage provider if already configured", () => {
    const storageProvider: StorageProvider = new IndexedDbStorageProvider();
    CacheProvider.configure("Default", storageProvider);

    const result = CacheProvider.configure("Default", storageProvider);

    expect(result).toBeDefined();
    expect(result!["Default"]).toBeInstanceOf(Cache);
  });

  it("should return the default storage provider if the specified name is not found", () => {
    const result = CacheProvider.getProvider("NonExistentProvider");

    expect(result).toBeInstanceOf(Cache);
  });

  it("should return the storage provider with the specified name", () => {
    const storageProvider: StorageProvider = new IndexedDbStorageProvider();
    CacheProvider.configure("CustomProvider", storageProvider);

    const result = CacheProvider.getProvider("CustomProvider");

    expect(result).toBeInstanceOf(Cache);
  });
});