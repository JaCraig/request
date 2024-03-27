import { DatabaseConnection } from "./Database";
import { Logger } from "@jacraig/woodchuck";

// Cache options are used to configure the cache entry
export interface CacheEntryOptions {
    // The expiration time of the item in milliseconds since the epoch (1/1/1970) or 0 for no expiration
    expirationTime: number;
    // The time in milliseconds to add to the expiration time when the item is accessed
    slidingExpirationTime: number;
    // If true, the expiration time will be reset every time the item is accessed
    sliding: boolean;
}

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

// The IndexedDbStorageProvider uses IndexedDB to store items in the cache
export class IndexedDbStorageProvider implements StorageProvider {
    // The database connection
    private database: DatabaseConnection;

    // Constructor
    constructor() {
        this.database = new DatabaseConnection("cacheStore", ["cache", "cacheEntryOptions"], 1);
    }

    // Clears the database of all items and options
    // Returns a promise that resolves when the operation is complete
    public async clear(): Promise<StorageProvider> {
        await this.database.openDatabase();
        let cacheEntryOptions = await this.database.getAll("cacheEntryOptions");
        let cacheEntries = await this.database.getAll("cache");
        for (let i = 0; i < cacheEntryOptions.length; i++) {
            let cacheEntry = cacheEntries[i];
            await this.remove(cacheEntry.key);
        }
        return this;
    }

    // Gets the options for an object in the database by key
    // key: The key of the object to get the options for
    // Returns a promise that resolves with the options
    public async getOptions(key: string): Promise<CacheEntryOptions> {
        await this.database.openDatabase();
        return this.database.getByKey("cacheEntryOptions", key);
    }

    // Adds an object to the database
    // obj: The object to add
    // key: The key to add the object with
    // options: The options to add the object with
    public async add(obj: any, key: string, options: CacheEntryOptions): Promise<StorageProvider> {
        await this.database.openDatabase();
        await this.database.add("cache", obj, key);
        await this.database.add("cacheEntryOptions", options, key);
        return this;
    }

    // Removes an object from the database
    // key: The key of the object to remove
    public async remove(key: string): Promise<StorageProvider> {
        await this.database.openDatabase();
        await this.database.remove("cache", key);
        await this.database.remove("cacheEntryOptions", key);
        return this;
    }

    // Gets an object from the database by key
    // table: The table to get the object from
    // key: The key of the object to get
    public async get(key: string): Promise<any> {
        await this.database.openDatabase();
        return this.database.getByKey("cache", key);
    }

    // Compacts the database. This is used to remove expired items from the database.
    // This method is called automatically by the cache.
    // Returns a promise that resolves when the operation is complete
    public async compact(): Promise<StorageProvider> {
        await this.database.openDatabase();
        let cacheEntryOptions = await this.database.getAll("cacheEntryOptions");
        let cacheEntries = await this.database.getAll("cache");
        let now = new Date().getTime();
        for (let i = 0; i < cacheEntryOptions.length; i++) {
            let cacheEntryOption = cacheEntryOptions[i];
            let cacheEntry = cacheEntries[i];
            if (cacheEntryOption.expirationTime == 0) {
                continue;
            }
            if (cacheEntryOption.expirationTime < now) {
                await this.remove(cacheEntry.key);
            }
        }
        return this;
    }
}


declare module globalThis {
    // The StorageProvider used by the cache
    var StorageProvider: StorageProvider;
}

// The Cache class is used to store objects in a persistent cache
export class Cache {
    // Hides the constructor
    private constructor() { }
    // Configures the cache with the specified storage provider
    // storageProvider: The storage provider to use for the cache
    public static configure(storageProvider: StorageProvider = new IndexedDbStorageProvider()): void {
        this.storageProvider ??= globalThis.StorageProvider || storageProvider || new IndexedDbStorageProvider();
        globalThis.StorageProvider = this.storageProvider;
    }

    // The storage provider to use for the cache
    private static storageProvider: StorageProvider;

    // Sets an object in the cache by key with the specified options
    // key: The key to set the object with
    // value: The value to set the object with
    // entryOptions: The options to set the object with
    // Returns a promise that resolves when the operation is complete
    public static async set(key: string, value: any, entryOptions: CacheEntryOptions = { expirationTime: 0, slidingExpirationTime: 0, sliding: false }): Promise<void> {
        Logger.debug("Setting object in cache: ", { "key": key, "value": value, "entryOptions": entryOptions });
        this.configure();
        await this.storageProvider.add(value, key, entryOptions);
    }

    // Gets an object from the cache by key and resets the expiration time if the object is set to sliding expiration
    // key: The key of the object to get
    // Returns a promise that resolves with the object
    public static async get(key: string): Promise<any> {
        Logger.debug("Getting object from cache: " + key);
        this.configure();
        await this.storageProvider.compact();
        let returnValue = await this.storageProvider.get(key);
        if (returnValue == null) {
            return returnValue;
        }
        let entryOptions = await this.storageProvider.getOptions(key);
        if (entryOptions.sliding) {
            await this.set(key, returnValue, {
                expirationTime: new Date().getTime() + entryOptions.slidingExpirationTime,
                slidingExpirationTime: entryOptions.slidingExpirationTime,
                sliding: true
            });
        }
        return returnValue;
    }

    // Removes an object from the cache by key
    // key: The key of the object to remove
    // Returns a promise that resolves when the operation is complete
    public static async remove(key: string): Promise<void> {
        Logger.debug("Removing object from cache: " + key);
        this.configure();
        await this.storageProvider.remove(key);
    }

    // Clears the cache of all items
    // Returns a promise that resolves when the operation is complete
    public static async clear(): Promise<void> {
        Logger.debug("Clearing cache");
        this.configure();
        await this.storageProvider.clear();
    }
}