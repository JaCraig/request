import { DatabaseConnection } from "../src/DatabaseConnection";

describe("DatabaseConnection", () => {
  let databaseConnection: DatabaseConnection;

  beforeEach(async () => {
    databaseConnection = new DatabaseConnection("testDB", ["table1", "table2"], 1);
    await databaseConnection.openDatabase();
  });

  afterEach(async () => {
    await databaseConnection.clear("table1");
    await databaseConnection.clear("table2");
    databaseConnection.close();
  });

  it("should add an object to the database", async () => {
    const obj = { name: "John Doe", age: 30 };
    const key = 1;

    await databaseConnection.add("table1", obj, key);

    const result = await databaseConnection.getByKey("table1", key);
    expect(result).toEqual(obj);
  });

  it("should remove an object from the database", async () => {
    const obj = { name: "John Doe", age: 30 };
    const key = 1;

    await databaseConnection.add("table1", obj, key);
    await databaseConnection.remove("table1", key);

    const result = await databaseConnection.getByKey("table1", key);
    expect(result).toBeUndefined();
  });

  it("should get an object from the database by key", async () => {
    const obj = { name: "John Doe", age: 30 };
    const key = 1;

    await databaseConnection.add("table1", obj, key);

    const result = await databaseConnection.getByKey("table1", key);
    expect(result).toEqual(obj);
  });

  it("should get all objects from the database", async () => {
    const obj1 = { name: "John Doe", age: 30 };
    const key1 = 1;

    const obj2 = { name: "Jane Smith", age: 25 };
    const key2 = 2;

    await databaseConnection.add("table1", obj1, key1);
    await databaseConnection.add("table1", obj2, key2);

    const result = await databaseConnection.getAll("table1");
    expect(result).toEqual([obj1, obj2]);
  });

  it("should clear the table of all items in the database", async () => {
    const obj = { name: "John Doe", age: 30 };
    const key = 1;

    await databaseConnection.add("table1", obj, key);
    await databaseConnection.clear("table1");

    const result = await databaseConnection.getByKey("table1", key);
    expect(result).toBeUndefined();
  });

  it("should get the keys for the table", async () => {
    const obj1 = { name: "John Doe", age: 30 };
    const key1 = 1;

    const obj2 = { name: "Jane Smith", age: 25 };
    const key2 = 2;

    await databaseConnection.add("table1", obj1, key1);
    await databaseConnection.add("table1", obj2, key2);

    const result = await databaseConnection.getKeys("table1");
    expect(result).toEqual([key1, key2]);
  });
});