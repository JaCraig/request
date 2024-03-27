'use strict';

var woodchuck = require('@jacraig/woodchuck');

class DatabaseConnection {
    constructor(dbName, tables, version) {
        this.dbName = dbName;
        this.tables = tables;
        this.version = version;
        const request = indexedDB.open(dbName, version);
        request.onupgradeneeded = (ev) => {
            this.database = ev.target.result;
            if (!this.database) {
                return;
            }
            for (const table of tables) {
                if (this.database.objectStoreNames.contains(table)) {
                    this.database.deleteObjectStore(table);
                }
                this.database.createObjectStore(table);
            }
        };
        request.onsuccess = (ev) => {
            this.database = ev.target.result;
        };
        request.onerror = (ev) => {
            woodchuck.Logger.error('Failed to open the database:', ev.target.error);
        };
    }
    openDatabase() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);
            request.onsuccess = (ev) => {
                this.database = ev.target.result;
                resolve(this);
            };
            request.onerror = (ev) => {
                woodchuck.Logger.error('Failed to open the database:', ev.target.error);
                reject(new Error('Failed to open the database:' + ev.target.error));
            };
        });
    }
    add(table, obj, key) {
        return new Promise((resolve, reject) => {
            if (!this.database) {
                woodchuck.Logger.error('Database connection is not open');
                reject(new Error('Database connection is not open'));
                return;
            }
            const transaction = this.database.transaction(table, 'readwrite');
            const objectStore = transaction.objectStore(table);
            const request = objectStore.put(obj, key);
            request.onsuccess = () => {
                resolve();
            };
            request.onerror = (ev) => {
                woodchuck.Logger.error('Failed to add an object to the database: ', ev.target.error);
                reject(new Error('Failed to add an object to the database: ' + ev.target.error));
            };
        });
    }
    remove(table, key) {
        return new Promise((resolve, reject) => {
            if (!this.database) {
                woodchuck.Logger.error('Database connection is not open');
                reject(new Error('Database connection is not open'));
                return;
            }
            const transaction = this.database.transaction(table, 'readwrite');
            const objectStore = transaction.objectStore(table);
            const request = objectStore.delete(key);
            request.onsuccess = () => {
                resolve();
            };
            request.onerror = (ev) => {
                woodchuck.Logger.error('Failed to remove an object from the database: ', ev.target.error);
                reject(new Error('Failed to remove an object from the database: ' + ev.target.error));
            };
        });
    }
    getByKey(table, key) {
        return new Promise((resolve, reject) => {
            if (!this.database) {
                woodchuck.Logger.error('Database connection is not open');
                reject(new Error('Database connection is not open'));
                return;
            }
            const transaction = this.database.transaction(table, 'readwrite');
            const objectStore = transaction.objectStore(table);
            const request = objectStore.get(key);
            request.onsuccess = (ev) => {
                resolve(ev.target.result);
            };
            request.onerror = (ev) => {
                woodchuck.Logger.error('Failed to retrieve an object from the database: ', ev.target.error);
                reject(new Error('Failed to retrieve an object from the database: ' + ev.target.error));
            };
        });
    }
    getKeys(table) {
        return new Promise((resolve, reject) => {
            if (!this.database) {
                woodchuck.Logger.error('Database connection is not open');
                reject(new Error('Database connection is not open'));
                return;
            }
            const transaction = this.database.transaction(table, 'readwrite');
            const objectStore = transaction.objectStore(table);
            const request = objectStore.getAllKeys();
            request.onsuccess = (ev) => {
                resolve(ev.target.result);
            };
            request.onerror = (ev) => {
                woodchuck.Logger.error('Failed to retrieve an object from the database: ', ev.target.error);
                reject(new Error('Failed to retrieve keys from the database: ' + ev.target.error));
            };
        });
    }
    get(table, query) {
        return new Promise((resolve, reject) => {
            if (!this.database) {
                woodchuck.Logger.error('Database connection is not open');
                reject(new Error('Database connection is not open'));
                return;
            }
            const transaction = this.database.transaction(table, 'readwrite');
            const objectStore = transaction.objectStore(table);
            const request = objectStore.get(query);
            request.onsuccess = (ev) => {
                resolve(ev.target.result);
            };
            request.onerror = (ev) => {
                woodchuck.Logger.error('Failed to retrieve an object from the database: ', ev.target.error);
                reject(new Error('Failed to retrieve an object from the database: ' + ev.target.error));
            };
        });
    }
    getAll(table, query) {
        return new Promise((resolve, reject) => {
            if (!this.database) {
                woodchuck.Logger.error('Database connection is not open');
                reject(new Error('Database connection is not open'));
                return;
            }
            const transaction = this.database.transaction(table, 'readwrite');
            const objectStore = transaction.objectStore(table);
            const request = objectStore.getAll(query);
            request.onsuccess = (ev) => {
                resolve(ev.target.result);
            };
            request.onerror = (ev) => {
                woodchuck.Logger.error('Failed to retrieve an object from the database: ', ev.target.error);
                reject(new Error('Failed to retrieve objects from the database: ' + ev.target.error));
            };
        });
    }
}

class IndexedDbStorageProvider {
    constructor() {
        this.database = new DatabaseConnection("cacheStore", ["cache", "cacheEntryOptions"], 1);
    }
    async clear() {
        await this.database.openDatabase();
        let cacheEntryOptions = await this.database.getAll("cacheEntryOptions");
        let cacheEntries = await this.database.getAll("cache");
        for (let i = 0; i < cacheEntryOptions.length; i++) {
            let cacheEntry = cacheEntries[i];
            await this.remove(cacheEntry.key);
        }
        return this;
    }
    async getOptions(key) {
        await this.database.openDatabase();
        return this.database.getByKey("cacheEntryOptions", key);
    }
    async add(obj, key, options) {
        await this.database.openDatabase();
        await this.database.add("cache", obj, key);
        await this.database.add("cacheEntryOptions", options, key);
        return this;
    }
    async remove(key) {
        await this.database.openDatabase();
        await this.database.remove("cache", key);
        await this.database.remove("cacheEntryOptions", key);
        return this;
    }
    async get(key) {
        await this.database.openDatabase();
        return this.database.getByKey("cache", key);
    }
    async compact() {
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
class Cache {
    constructor() { }
    static configure(storageProvider = new IndexedDbStorageProvider()) {
        this.storageProvider ??= globalThis.StorageProvider || storageProvider || new IndexedDbStorageProvider();
        globalThis.StorageProvider = this.storageProvider;
    }
    static async set(key, value, entryOptions = { expirationTime: 0, slidingExpirationTime: 0, sliding: false }) {
        woodchuck.Logger.debug("Setting object in cache: ", { "key": key, "value": value, "entryOptions": entryOptions });
        this.configure();
        await this.storageProvider.add(value, key, entryOptions);
    }
    static async get(key) {
        woodchuck.Logger.debug("Getting object from cache: " + key);
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
    static async remove(key) {
        woodchuck.Logger.debug("Removing object from cache: " + key);
        this.configure();
        await this.storageProvider.remove(key);
    }
    static async clear() {
        woodchuck.Logger.debug("Clearing cache");
        this.configure();
        await this.storageProvider.clear();
    }
}

class CancellationToken {
    constructor() {
        this.canceled = false;
    }
}
class Request {
    constructor(options) {
        this.options = {
            method: "GET",
            url: "",
            headers: {},
            credentials: "same-origin",
            serializer: JSON.stringify,
            parser: (response) => response.json(),
            success: (response) => { woodchuck.Logger.debug("Request response from " + this.options.url + ":", response); },
            error: (reason) => { woodchuck.Logger.error("Request error from " + this.options.url + ":", reason); },
            retry: (attempt) => { woodchuck.Logger.debug("Request retry on " + this.options.url + ":", { "attempt": attempt }); },
            storageMode: exports.StorageMode.NetworkFirst,
            cacheKey: "",
            timeout: 60000,
            retryAttempts: 3,
            retryDelay: 1000
        };
        this.abortController = null;
        this.options = { ...this.options, ...options };
    }
    static get(url, data) {
        return new Request({ method: "GET", url, data, cacheKey: url + JSON.stringify(data) })
            .withHeaders({
            "Accept": "application/json"
        });
    }
    static post(url, data) {
        return new Request({ method: "POST", url, data, cacheKey: url + JSON.stringify(data), storageMode: exports.StorageMode.NetworkOnly })
            .withHeaders({
            "Content-Type": "application/json",
            "Accept": "application/json"
        });
    }
    static put(url, data) {
        return new Request({ method: "PUT", url, data, cacheKey: url + JSON.stringify(data), storageMode: exports.StorageMode.NetworkOnly })
            .withHeaders({
            "Content-Type": "application/json",
            "Accept": "application/json"
        });
    }
    static delete(url, data) {
        return new Request({ method: "DELETE", url, data, cacheKey: url + JSON.stringify(data), storageMode: exports.StorageMode.NetworkOnly })
            .withHeaders({
            "Accept": "application/json"
        });
    }
    static ofType(method, url, data) {
        return new Request({ method, url, data, cacheKey: url + JSON.stringify(data) })
            .withHeaders({
            "Accept": "application/json"
        });
    }
    withAuthenticationProvider(authenticationProvider) {
        this.options.authenticationProvider = authenticationProvider;
        return this;
    }
    withHeaders(headers) {
        this.options.headers = { ...this.options.headers, ...headers };
        return this;
    }
    withCancellationToken(cancellationToken) {
        this.options.cancellationToken = cancellationToken;
        return this;
    }
    withCredentials(credentials) {
        this.options.credentials = credentials;
        return this;
    }
    withSerializer(serializer) {
        this.options.serializer = serializer;
        return this;
    }
    withParser(parser) {
        this.options.parser = parser;
        return this;
    }
    onSuccess(callback) {
        this.options.success = callback ?? ((response) => { woodchuck.Logger.debug("Request response:", response); });
        return this;
    }
    onError(callback) {
        this.options.error = callback ?? ((reason) => { woodchuck.Logger.error("Request error:", reason); });
        return this;
    }
    onRetry(callback) {
        this.options.retry = callback ?? ((attempt) => { woodchuck.Logger.debug("Request retry:", { "attempt": attempt }); });
        return this;
    }
    withStorageMode(storageMode) {
        this.options.storageMode = storageMode;
        return this;
    }
    withCacheKey(cacheKey) {
        this.options.cacheKey = cacheKey;
        return this;
    }
    withTimeout(timeout) {
        this.options.timeout = timeout ?? 60000;
        return this;
    }
    withRetryAttempts(retryAttempts) {
        this.options.retryAttempts = retryAttempts;
        return this;
    }
    withRetryDelay(retryDelay) {
        this.options.retryDelay = retryDelay;
        return this;
    }
    abort() {
        if (this.abortController == null || this.options.error == null) {
            return this;
        }
        this.abortController.abort();
        this.options.error(new Error("The request was aborted."));
        return this;
    }
    async send() {
        const { authenticationProvider, method, url, data, headers, credentials, serializer, parser, success, error, storageMode, cacheKey, timeout, retryAttempts, retryDelay, retry, cancellationToken } = this.options;
        const abortController = new AbortController();
        this.abortController = abortController;
        let attempts = 0;
        let lastError = null;
        let successMethod = success || ((response) => { woodchuck.Logger.debug("Request response from " + url + ":", response); });
        let errorMethod = error || ((reason) => { woodchuck.Logger.error("Request error from " + url + ":", reason); });
        let serializerMethod = serializer || JSON.stringify;
        let parserMethod = parser || ((response) => response.json());
        let retryMethod = retry || ((attempt) => { woodchuck.Logger.debug("Request retry on " + url + ":", { "attempt": attempt }); });
        const sendRequest = async () => {
            if (storageMode === exports.StorageMode.StorageFirst || storageMode === exports.StorageMode.StorageAndUpdate) {
                const cachedValue = await Cache.get(cacheKey || "");
                if (cachedValue !== undefined) {
                    successMethod(cachedValue);
                    if (storageMode === exports.StorageMode.StorageFirst) {
                        return cachedValue;
                    }
                }
            }
            if (!navigator.onLine) {
                if (storageMode === exports.StorageMode.NetworkFirst) {
                    const cachedValue = await Cache.get(cacheKey || "");
                    if (cachedValue !== undefined) {
                        successMethod(cachedValue);
                        return cachedValue;
                    }
                }
                const errorMessage = new Error("System is offline");
                errorMethod(errorMessage);
                return Promise.reject(errorMessage);
            }
            try {
                const serializedData = serializerMethod(data);
                await authenticationProvider?.authenticate(this);
                const response = await Promise.race([
                    fetch(url, {
                        method,
                        credentials,
                        headers,
                        body: serializedData,
                        signal: abortController.signal,
                    }),
                    this.handleTimeout(timeout)
                ]);
                if (cancellationToken?.canceled) {
                    return Promise.reject(new Error("The request was canceled."));
                }
                if (response.status >= 200 && response.status < 300) {
                    const parsedResponse = await parserMethod(response);
                    successMethod(parsedResponse);
                    if (storageMode !== exports.StorageMode.NetworkOnly) {
                        await Cache.set(cacheKey || "", parsedResponse);
                    }
                    return parsedResponse;
                }
                lastError = new Error(response.statusText);
                if (response.status === 401) {
                    await authenticationProvider?.authenticationFailed(this, response);
                }
            }
            catch (err) {
                lastError = err;
            }
            if (attempts < (retryAttempts || 0)) {
                ++attempts;
                await new Promise(resolve => setTimeout(resolve, retryDelay));
                retryMethod(attempts);
                return sendRequest();
            }
            errorMethod(lastError);
            return Promise.reject(lastError);
        };
        return sendRequest();
    }
    async handleTimeout(timeout) {
        timeout ??= 60000;
        await new Promise((_, reject) => {
            setTimeout(() => {
                reject(new Error('Request timeout'));
            }, timeout);
        });
        throw new Error('Request timeout');
    }
}
exports.StorageMode = void 0;
(function (StorageMode) {
    StorageMode[StorageMode["NetworkFirst"] = 0] = "NetworkFirst";
    StorageMode[StorageMode["StorageFirst"] = 1] = "StorageFirst";
    StorageMode[StorageMode["NetworkOnly"] = 2] = "NetworkOnly";
    StorageMode[StorageMode["StorageAndUpdate"] = 3] = "StorageAndUpdate";
})(exports.StorageMode || (exports.StorageMode = {}));

exports.Cache = Cache;
exports.CancellationToken = CancellationToken;
exports.IndexedDbStorageProvider = IndexedDbStorageProvider;
exports.Request = Request;
