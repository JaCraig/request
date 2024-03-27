export declare class DatabaseConnection {
    private dbName;
    private tables;
    private version;
    private database;
    constructor(dbName: string, tables: string[], version: number);
    openDatabase(): Promise<DatabaseConnection>;
    add(table: string, obj: any, key: IDBValidKey): Promise<void>;
    remove(table: string, key: IDBValidKey): Promise<void>;
    getByKey(table: string, key: IDBValidKey): Promise<any>;
    getKeys(table: string): Promise<IDBValidKey[]>;
    get(table: string, query: string): Promise<any>;
    getAll(table: string, query?: string): Promise<any[]>;
}
//# sourceMappingURL=Database.d.ts.map