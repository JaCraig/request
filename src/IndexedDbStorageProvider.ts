import { CacheEntryOptions } from "./CacheEntryOptions";
import { DatabaseConnection } from "./DatabaseConnection";
import { StorageEntry } from "./StorageEntry";
import { StorageProvider } from "./StorageProvider";

// The IndexedDbStorageProvider uses IndexedDB to store items in the cache
export class IndexedDbStorageProvider implements StorageProvider {
    // The database connection
    private database: DatabaseConnection;

    // Constructor
    constructor() {
        this.storage = new Map<string, StorageEntry<any>>();
        this.database = new DatabaseConnection("cacheStore", ["cache", "cacheEntryOptions"]);
    }

    // Clears the database of all items and options
    // Returns a promise that resolves when the operation is complete
    public async clear(): Promise<StorageProvider> {
        this.storage.clear();
        await this.database.openDatabase();
        this.database.clear("cache");
        this.database.clear("cacheEntryOptions");
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
        this.storage.has(key) ? this.storage.get(key)!.value = obj : this.storage.set(key, { promise: Promise.resolve(obj), value: obj, options: options });
        await this.database.openDatabase();
        await this.database.add("cache", obj, key);
        await this.database.add("cacheEntryOptions", options, key);
        return this;
    }

    // Removes an object from the database
    // key: The key of the object to remove
    public async remove(key: string): Promise<StorageProvider> {
        this.storage.delete(key);
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
    
    // Retrieves the value associated with the specified key from the storage provider.
    // If the value does not exist, it falls back to the provided promise and adds the value to the storage.
    // key: The key to retrieve the value for
    // fallBack: A promise that resolves to the fallback value if the key does not exist
    // options: The options for the cache entry
    // Returns a promise that resolves to the retrieved or fallback value
    public async getOrCreate(key: string, fallBack: AsyncFunction<any>, options: CacheEntryOptions): Promise<any> {
        let value = await this.get(key);
        if(value != null) {
            return value;   
        }
        if(this.storage.has(key)) {
            let entry = this.storage.get(key);
            if(entry?.value!== undefined) {
                return entry.value;
            }
            return entry?.promise;
        }
        const promise = (async()=>{
            const value = await fallBack();
            await this.add(value, key, options);
            return value;
        })();
        this.storage.set(key, { promise: promise, value: undefined, options: options });
        return promise;
    }

    // Compacts the database. This is used to remove expired items from the database.
    // This method is called automatically by the cache.
    // Returns a promise that resolves when the operation is complete
    public async compact(): Promise<StorageProvider> {
        await this.database.openDatabase();
        let cacheKeys = await this.database.getKeys("cache");
        let now = new Date().getTime();
        for (let i = 0; i < cacheKeys.length; i++) {
            let key = cacheKeys[i];
            let cacheEntryOption = await this.database.getByKey("cacheEntryOptions", key);
            if (cacheEntryOption.expirationTime == 0 || cacheEntryOption.expirationTime >= now) {
                continue;
            }
            this.storage.delete(key);
            await this.database.remove("cache", key);
            await this.database.remove("cacheEntryOptions", key);
        }
        return this;
    }
    
    // The storage used by the storage provider
    private storage: Map<IDBValidKey, StorageEntry<any>>;
}
