// Cache options are used to configure the cache entry
export interface CacheEntryOptions {
    // The expiration time of the item in milliseconds since the epoch (1/1/1970) or 0 for no expiration
    expirationTime: number;
    // The time in milliseconds to add to the expiration time when the item is accessed
    slidingExpirationTime: number;
    // If true, the expiration time will be reset every time the item is accessed
    sliding: boolean;
}
