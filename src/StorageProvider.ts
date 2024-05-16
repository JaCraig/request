import { CacheEntryOptions } from "./CacheEntryOptions";

// Storage providers are used to store items in the cache in a persistent manner
export interface StorageProvider {
    // Adds an object to the cache
    // obj: The object to add
    // key: The key to add the object with
    // options: The options to add the object with
    // Returns a promise that resolves when the operation is complete
    add(obj: any, key: string, options: CacheEntryOptions): Promise<StorageProvider>;

    // Removes an object from the cache
    // key: The key of the object to remove
    // Returns a promise that resolves when the operation is complete
    remove(key: string): Promise<StorageProvider>;

    // Gets an object from the cache by key
    // key: The key of the object to get
    // Returns a promise that resolves with the object
    get(key: string): Promise<any>;

    // Gets the value associated with the specified key. If the value does not exist, it creates a new value using the fallBack promise.
    // key: The key of the object to get or create
    // fallBack: The promise to create the object if it does not exist
    // options: The options to use when creating the object
    // Returns a promise that resolves with the object
    getOrCreate(key: string, fallBack: AsyncFunction<any>, options: CacheEntryOptions): Promise<any>;

    // Gets the options for an object in the cache by key
    // key: The key of the object to get the options for
    // Returns a promise that resolves with the options
    getOptions(key: string): Promise<CacheEntryOptions>;

    // Compacts the cache. This is used to remove expired items from the cache.
    // This method is called automatically by the cache.
    // Returns a promise that resolves when the operation is complete
    compact(): Promise<StorageProvider>;

    // Clears the cache of all items
    // Returns a promise that resolves when the operation is complete
    clear(): Promise<StorageProvider>;
}
