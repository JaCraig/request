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
    public add(table: string, obj: any, key: IDBValidKey): Promise<void> {
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

    // Removes an object from the database
    // table: The table to remove the object from
    // key: The key of the object to remove
    public remove(table: string, key: IDBValidKey): Promise<void> {
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
    public getByKey(table: string, key: IDBValidKey): Promise<any> {
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
    public getKeys(table: string): Promise<IDBValidKey[]> {
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
    public get(table: string, query: string): Promise<any> {
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
    public getAll(table: string, query?: string): Promise<any[]> {
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