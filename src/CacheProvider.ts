import { Logger } from "@jacraig/woodchuck";
import { StorageProvider } from "./StorageProvider";
import { IndexedDbStorageProvider } from "./IndexedDbStorageProvider";
import { Cache } from "./Cache";


// StorageProviderDictionary is a dictionary of storage providers
export type StorageProviderDictionary = { [key: string]: Cache } | undefined;

// The globalThis namespace is used to store the storage providers for the cache
export declare module globalThis {
    // The StorageProvider dictionary used by the cache to allow multiple storage providers to be used
    var StorageProviders: StorageProviderDictionary;
}

// The CacheProvider class is used to hold the storage providers for the cache
export class CacheProvider {
    // Hides the constructor
    private constructor() { }

    // Storage providers to use for the cache
    private static storageProviders: StorageProviderDictionary;

    // Configures the cache with the specified storage provider
    // name: The name of the storage provider to use for the cache
    // storageProvider: The storage provider to use for the cache
    // Returns the storage provider dictionary
    public static configure(name: string = "Default", storageProvider: StorageProvider = new IndexedDbStorageProvider()): StorageProviderDictionary {
        Logger.debug("Configuring cache with storage provider: ", { "name": name, "storageProvider": storageProvider });
        this.storageProviders ??= globalThis.StorageProviders ?? {};
        if (this.storageProviders[name] != null) {
            Logger.debug("Cache already configured with storage provider: ", { "name": name });
            return this.storageProviders;
        }
        this.storageProviders[name] = new Cache(storageProvider ?? new IndexedDbStorageProvider());
        globalThis.StorageProviders = this.storageProviders;
        return this.storageProviders;
    }

    // Gets the storage provider with the specified name
    // name: The name of the storage provider to get
    // Returns the storage provider with the specified name or the default storage provider if the name is not found
    public static getProvider(name: string = "Default"): Cache {
        let Providers = this.configure(name);
        if (Providers == undefined) {
            return new Cache(new IndexedDbStorageProvider());
        }
        return Providers[name] ?? new Cache(new IndexedDbStorageProvider());
    }
}
