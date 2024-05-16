import { CacheEntryOptions } from "./CacheEntryOptions";
import { Logger } from "@jacraig/woodchuck";
import { StorageProvider } from "./StorageProvider";

// The Cache class is used to store objects in a persistent cache
export class Cache {
    // Constructor
    // provider: The storage provider to use for the cache
    constructor(provider: StorageProvider) {
        this.storageProvider = provider;
     }

    // The storage provider used by the cache
    private storageProvider: StorageProvider;

    // Sets an object in the cache by key with the specified options
    // key: The key to set the object with
    // value: The value to set the object with
    // entryOptions: The options to set the object with
    // Returns a promise that resolves when the operation is complete
    public async set(key: string, value: any, entryOptions: CacheEntryOptions = { expirationTime: 0, slidingExpirationTime: 0, sliding: false }): Promise<void> {
        Logger.debug("Setting object in cache: ", { "key": key, "value": value, "entryOptions": entryOptions });
        await this.storageProvider.add(value, key, entryOptions);
    }

    // Gets an object from the cache by key and resets the expiration time if the object is set to sliding expiration
    // key: The key of the object to get
    // Returns a promise that resolves with the object
    public async get(key: string): Promise<any> {
        Logger.debug("Getting object from cache: " + key);
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

    // Gets an object from the cache by key or creates it using the fallBack promise if it does not exist
    // key: The key of the object to get or create
    // fallBack: The promise to create the object if it does not exist
    // options: The options to use when creating the object
    // Returns a promise that resolves with the object
    public async getOrCreate(key: string, fallBack: AsyncFunction<any>, options: CacheEntryOptions = { expirationTime: 0, slidingExpirationTime: 0, sliding: false }): Promise<any> {
        Logger.debug("Getting object from cache or creating it: ", { "key": key });
        await this.storageProvider.compact();
        let returnValue = await this.storageProvider.getOrCreate(key, fallBack, options);
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
    public async remove(key: string): Promise<void> {
        Logger.debug("Removing object from cache: " + key);
        await this.storageProvider.remove(key);
    }

    // Clears the cache of all items
    // Returns a promise that resolves when the operation is complete
    public async clear(): Promise<void> {
        Logger.debug("Clearing cache");
        await this.storageProvider.clear();
    }
}