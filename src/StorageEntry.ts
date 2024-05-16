import { CacheEntryOptions } from "./CacheEntryOptions";

// The storage entry type
export type StorageEntry<TEntry> = { promise: Promise<TEntry>; value: TEntry | undefined; options: CacheEntryOptions; };
