export interface CacheEntryOptions {
    expirationTime: number;
    slidingExpirationTime: number;
    sliding: boolean;
}
export interface StorageProvider {
    add(obj: any, key: string, options: CacheEntryOptions): Promise<StorageProvider>;
    remove(key: string): Promise<StorageProvider>;
    get(key: string): Promise<any>;
    getOptions(key: string): Promise<CacheEntryOptions>;
    compact(): Promise<StorageProvider>;
    clear(): Promise<StorageProvider>;
}
export declare class IndexedDbStorageProvider implements StorageProvider {
    private database;
    constructor();
    clear(): Promise<StorageProvider>;
    getOptions(key: string): Promise<CacheEntryOptions>;
    add(obj: any, key: string, options: CacheEntryOptions): Promise<StorageProvider>;
    remove(key: string): Promise<StorageProvider>;
    get(key: string): Promise<any>;
    compact(): Promise<StorageProvider>;
}
export declare class Cache {
    private constructor();
    static configure(storageProvider?: StorageProvider): void;
    private static storageProvider;
    static set(key: string, value: any, entryOptions?: CacheEntryOptions): Promise<void>;
    static get(key: string): Promise<any>;
    static remove(key: string): Promise<void>;
    static clear(): Promise<void>;
}
//# sourceMappingURL=Cache.d.ts.map