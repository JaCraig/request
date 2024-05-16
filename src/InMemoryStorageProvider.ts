import { CacheEntryOptions } from "./CacheEntryOptions";
import { StorageEntry } from "./StorageEntry";
import { StorageProvider } from "./StorageProvider";

// The InMemoryStorageProvider class is used to store objects in memory
export class InMemoryStorageProvider implements StorageProvider {
    // Constructor
    constructor() {
        this.storage = new Map<string, StorageEntry<any>>();
    }

    // Adds an object to the storage provider
    // obj: The object to add
    // key: The key to add the object with
    // options: The options to add the object with
    // Returns a promise that resolves when the operation is complete
    public add(obj: any, key: string, options: CacheEntryOptions): Promise<StorageProvider> {
        this.storage.set(key, { promise: Promise.resolve(obj), value: obj, options: options });
        return Promise.resolve(this);
    }

    // Removes an object from the storage provider
    // key: The key of the object to remove
    // Returns a promise that resolves when the operation is complete
    public remove(key: string): Promise<StorageProvider> {
        this.storage.delete(key);
        return Promise.resolve(this);
    }

    // Gets an object from the storage provider by key
    // key: The key of the object to get
    // Returns a promise that resolves with the object
    public get(key: string): Promise<any> {
        if(!this.storage.has(key)) {
            return Promise.resolve(undefined);
        }
        const entry = this.storage.get(key);
        if (entry == undefined) {
            return Promise.resolve(undefined);
        }
        if (entry.value != undefined) {
            return Promise.resolve(entry.value);
        }
        return entry.promise;
    }

    // Gets the value associated with the specified key. If the value does not exist, it creates a new value using the fallBack promise.
    // key: The key of the object to get or create
    // fallBack: The promise to create the object if it does not exist
    // options: The options to use when creating the object
    // Returns a promise that resolves with the object
    public async getOrCreate(key: string, fallBack: AsyncFunction<any>, options: CacheEntryOptions): Promise<any> {
        if(this.storage.has(key)) {
            return this.get(key);
        }
        const promise = (async()=>{
            const value = await fallBack();
            this.storage.get(key)!.value = value;
            return value;
        })();
        this.storage.set(key, { promise: promise, value: undefined, options: options });
        return promise;
    }

    // Gets the options for an object in the storage provider by key
    // key: The key of the object to get the options for
    // Returns a promise that resolves with the options
    public getOptions(key: string): Promise<CacheEntryOptions> {
        return Promise.resolve(this.storage.get(key)!.options);
    }

    // Compacts the storage provider. This is used to remove expired items from the storage provider.
    // This method is called automatically by the cache.
    // Returns a promise that resolves when the operation is complete
    public compact(): Promise<StorageProvider> {
        const now = new Date().getTime();
        for (const [key, entry] of this.storage) {
            if(entry.options.expirationTime == 0 || entry.options.expirationTime >= now) {
                continue;
            }
            this.remove(key);
        }
        return Promise.resolve(this);
    }

    // Clears the storage provider of all items
    // Returns a promise that resolves when the operation is complete
    public clear(): Promise<StorageProvider> {
        this.storage.clear();
        return Promise.resolve(this);
    }

    // The storage used by the storage provider
    private storage: Map<string, StorageEntry<any>>;
}