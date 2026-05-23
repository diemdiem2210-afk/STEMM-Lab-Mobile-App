import * as SQLite from "expo-sqlite";

export const db = SQLite.openDatabaseSync("stemm_lab.db");

export const initDatabase = async () => {
  try {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS results (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        activityId TEXT,
        activityName TEXT,
        userId TEXT,
        username TEXT,
        score INTEGER,
        notes TEXT,
        createdAt TEXT
      );
    `);

    console.log("SQLite database initialized");
  } catch (error) {
    console.error("SQLite init error:", error);
  }
};