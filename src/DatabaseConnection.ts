import { Logger } from "@jacraig/woodchuck";

// Database connection handler
export class DatabaseConnection {
    // The database connection
    private database: IDBDatabase|undefined;

    // Constructor
    // dbName: The name of the database
    // tables: The tables to create
    // version: The version of the database
    constructor(private dbName: string, private tables: string[], private version: number) {
        const request = indexedDB.open(dbName, version);

        request.onupgradeneeded = (ev: any) => {
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

        request.onsuccess = (ev: any) => {
            this.database = ev.target.result;
        };

        request.onerror = (ev: any) => {
            Logger.error('Failed to open the database:', ev.target.error);
        };
    }

    // Opens the database connection
    // Returns the database connection
    public openDatabase(): Promise<DatabaseConnection> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onsuccess = (ev: any) => {
                this.database = ev.target.result;
                resolve(this);
            };

            request.onerror = (ev: any) => {
                Logger.error('Failed to open the database:', ev.target.error);
                reject(new Error('Failed to open the database:' + ev.target.error));
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
}