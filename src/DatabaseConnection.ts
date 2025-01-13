import { Logger } from "@jacraig/woodchuck";

// Database connection handler
export class DatabaseConnection {
    // The database connection
    private database: IDBDatabase|undefined;

    // Constructor
    // dbName: The name of the database
    // tables: The tables to create
    // version: The version of the database
    constructor(private dbName: string, private tables: string[], private version?: number) {
    }

    // Opens the database connection
    // Returns the database connection
    public openDatabase(): Promise<DatabaseConnection> {
        let that = this;

        return new Promise((resolve, reject) => {
            if (that.database) {
                return resolve(that);
            }
            this.ensureObjectStoreExists(this.dbName, this.tables).then(() => {
                let request = indexedDB.open(that.dbName, that.version);
                request.onsuccess = (ev: any) => {
                    that.database = ev.target.result;
                    return resolve(that);
                };
                request.onerror = (ev: any) => {
                    return reject(ev);
                };
                request.onupgradeneeded = (ev: any) => {
                    that.database = ev.target.result;
                    if (!that.database) {
                        return reject(new Error("Failed to open the database"));
                    }
                    for (let x = 0; x < that.tables.length; ++x) {
                        let table = that.tables[x];
                        if (that.database.objectStoreNames.contains(table)) {
                            that.database.deleteObjectStore(table);
                        }
                        that.database.createObjectStore(table);
                    }
                };
                request.onblocked = (ev: any) => {
                    return reject(new Error("Database connection blocked"));
                };
            }).catch(reject);
        });
    }

    // Ensures that the object store exists
    // dbName: The name of the database
    // tables: The tables to create
    // options: The options for the object store
    private ensureObjectStoreExists(dbName: string, tables: string[], options: any = {}): Promise<boolean> {
        let retries = 0;
        let that = this;
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(dbName);
    
            request.onsuccess = (event: any) => {
                const db = event.target.result;
                that.version = db.version;
                let missingTables = tables.filter((table) => !db.objectStoreNames.contains(table));
                if (missingTables.length == 0) {
                    db.close();
                    resolve(true);
                    return;
                }

                // Close the existing connection
                db.close();
    
                // Increment the version to create the object store
                const newVersion = db.version + 1;
                that.version = newVersion;
                const upgradeRequest = indexedDB.open(dbName, newVersion);
    
                upgradeRequest.onupgradeneeded = (event:any) => {
                    const database = event.target.result;
                    for (let x = 0; x < missingTables.length; ++x) {
                        let table = missingTables[x];
                        database.createObjectStore(table);
                    }
                };
    
                upgradeRequest.onsuccess = () => {
                    upgradeRequest.result.close();
                    resolve(true);
                };
    
                upgradeRequest.onerror = (e:any) => {
                    Logger.error("Error upgrading database:",e.target.error);
                    reject(new Error("Error upgrading database: " + e.target.error));
                };
    
                upgradeRequest.onblocked = (e: any) => {
                    retries++;
                    if (retries > 3) {
                        reject(new Error("Database upgrade blocked"));
                        return;
                    }
    
                    setTimeout(() => {
                        that.ensureObjectStoreExists(dbName, tables, options).then(resolve, reject);
                    }, 1000);
                };
            };
    
            request.onerror = (e:any) => {
                Logger.error("Error opening database:",e.target.error);
                reject(e.target.error);
            };
        });
    }

    // Adds an object to the database
    // table: The table to add the object to
    // obj: The object to add
    // key: The key to add the object with
    // Returns a promise that resolves when the operation is complete
    public add(table: string, obj: any, key: IDBValidKey): Promise<void> {
        if (table == null || key == null) {
            Logger.error('Table and key must be specified to add an object to the database');
            return Promise.reject(new Error('Table and key must be specified to add an object to the database'));
        }
        return new Promise((resolve, reject) => {
            if(!this.database) {
                Logger.error('Database connection is not open');
                reject(new Error('Database connection is not open'));
                return;
            }
            const transaction = this.database.transaction(table, 'readwrite');
            const objectStore = transaction.objectStore(table);
            const request = objectStore.put(obj, key);

            request.onsuccess = () => {
                resolve();
            };

            request.onerror = (ev: any) => {
                Logger.error('Failed to add an object to the database: ', ev.target.error);
                reject(new Error('Failed to add an object to the database: ' + ev.target.error));
            };
        });
    }

    // Clears the table of all items in the database
    // table: The table to clear
    // Returns a promise that resolves when the operation is complete
    public clear(table: string): Promise<void> {
        if (table == null) {
            Logger.error('Table must be specified to clear the database');
            return Promise.reject(new Error('Table must be specified to clear the database'));
        }
        return new Promise((resolve, reject) => {
            if(!this.database) {
                Logger.error('Database connection is not open');
                reject(new Error('Database connection is not open'));
                return;
            }
            const transaction = this.database.transaction(table, 'readwrite');
            const objectStore = transaction.objectStore(table);
            const request = objectStore.clear();

            request.onsuccess = () => {
                resolve();
            };

            request.onerror = (ev: any) => {
                Logger.error('Failed to clear the database: ', ev.target.error);
                reject(new Error('Failed to clear the database: ' + ev.target.error));
            };
        });
    }

    // Removes an object from the database
    // table: The table to remove the object from
    // key: The key of the object to remove
    // Returns a promise that resolves when the operation is complete
    public remove(table: string, key: IDBValidKey): Promise<void> {
        if (table == null || key == null) {
            Logger.error('Table and key must be specified to remove an object from the database');
            return Promise.reject(new Error('Table and key must be specified to remove an object from the database'));
        }
        return new Promise((resolve, reject) => {
            if(!this.database) {
                Logger.error('Database connection is not open');
                reject(new Error('Database connection is not open'));
                return;
            }
            const transaction = this.database.transaction(table, 'readwrite');
            const objectStore = transaction.objectStore(table);
            const request = objectStore.delete(key);

            request.onsuccess = () => {
                resolve();
            };

            request.onerror = (ev: any) => {
                Logger.error('Failed to remove an object from the database: ', ev.target.error);
                reject(new Error('Failed to remove an object from the database: ' + ev.target.error));
            };
        });
    }

    // Gets an object from the database by key
    // table: The table to get the object from
    // key: The key of the object to get
    // Returns the object
    public getByKey(table: string, key: IDBValidKey): Promise<any> {
        if (table == null || key == null) {
            Logger.error('Table and key must be specified to get an object from the database');
            return Promise.reject(new Error('Table and key must be specified to get an object from the database'));
        }
        return new Promise((resolve, reject) => {
            if(!this.database) {
                Logger.error('Database connection is not open');
                reject(new Error('Database connection is not open'));
                return;
            }
            const transaction = this.database.transaction(table, 'readwrite');
            const objectStore = transaction.objectStore(table);
            const request = objectStore.get(key);

            request.onsuccess = (ev: any) => {
                resolve(ev.target.result);
            };

            request.onerror = (ev: any) => {
                Logger.error('Failed to retrieve an object from the database: ', ev.target.error);
                reject(new Error('Failed to retrieve an object from the database: ' + ev.target.error));
            };
        });
    }

    // Gets all objects from the database
    // table: The table to get the objects from
    // query: The query to filter the objects by
    // Returns the keys for the table
    public getKeys(table: string): Promise<IDBValidKey[]> {
        if (table == null ) {
            Logger.error('Table must be specified to get keys from the database');
            return Promise.reject(new Error('Table must be specified to get keys from the database'));
        }
        return new Promise((resolve, reject) => {
            if(!this.database) {
                Logger.error('Database connection is not open');
                reject(new Error('Database connection is not open'));
                return;
            }
            const transaction = this.database.transaction(table, 'readwrite');
            const objectStore = transaction.objectStore(table);
            const request = objectStore.getAllKeys();

            request.onsuccess = (ev: any) => {
                resolve(ev.target.result);
            };

            request.onerror = (ev: any) => {
                Logger.error('Failed to retrieve an object from the database: ', ev.target.error);
                reject(new Error('Failed to retrieve keys from the database: ' + ev.target.error));
            };
        });
    }

    // Gets an object from the database by key
    // table: The table to get the object from
    // query: The query to filter the objects by
    // Returns the object
    public get(table: string, query: string): Promise<any> {
        if(table == null || query == null) {
            Logger.error('Table and query must be specified to get an object from the database');
            return Promise.reject(new Error('Table and query must be specified to get an object from the database'));
        }
        return new Promise((resolve, reject) => {
            if(!this.database) {
                Logger.error('Database connection is not open');
                reject(new Error('Database connection is not open'));
                return;
            }

            const transaction = this.database.transaction(table, 'readwrite');
            const objectStore = transaction.objectStore(table);
            const request = objectStore.get(query);

            request.onsuccess = (ev: any) => {
                resolve(ev.target.result);
            };

            request.onerror = (ev: any) => {
                Logger.error('Failed to retrieve an object from the database: ', ev.target.error);
                reject(new Error('Failed to retrieve an object from the database: ' + ev.target.error));
            };
        });
    }

    // Gets all objects from the database
    // table: The table to get the objects from
    // query: The query to filter the objects by
    // Returns the objects
    public getAll(table: string, query?: string): Promise<any[]> {
        if(table == null) {
            Logger.error('Table must be specified to get objects from the database');
            return Promise.reject(new Error('Table must be specified to get objects from the database'));
        }
        return new Promise((resolve, reject) => {
            if(!this.database) {
                Logger.error('Database connection is not open');
                reject(new Error('Database connection is not open'));
                return;
            }
            const transaction = this.database.transaction(table, 'readwrite');
            const objectStore = transaction.objectStore(table);
            const request = objectStore.getAll(query);

            request.onsuccess = (ev: any) => {
                resolve(ev.target.result);
            };

            request.onerror = (ev: any) => {
                Logger.error('Failed to retrieve an object from the database: ', ev.target.error);
                reject(new Error('Failed to retrieve objects from the database: ' + ev.target.error));
            };
        });
    }

    // Closes the database connection
    public close(): void {
        if(this.database) {
            this.database.close();
            this.database = undefined;
        }
    }
}