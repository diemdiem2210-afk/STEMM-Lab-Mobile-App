import * as SQLite from "expo-sqlite";

export type SavedActivityResult = {
  id?: number;
  activityId: string;
  activityName: string;
  createdAt: string;

  // This stores the full original result object from each activity
  [key: string]: any;
};

const db = SQLite.openDatabaseSync("stemm_lab.db");

export const setupLocalResultDatabase = async () => {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS activity_results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      activityId TEXT NOT NULL,
      activityName TEXT NOT NULL,
      fullResultJson TEXT NOT NULL,
      createdAt TEXT NOT NULL
    );
  `);
};

export const saveFullResultLocal = async (
  result: SavedActivityResult
) => {
  await setupLocalResultDatabase();

  await db.runAsync(
    `
    INSERT INTO activity_results (
      activityId,
      activityName,
      fullResultJson,
      createdAt
    )
    VALUES (?, ?, ?, ?)
    `,
    [
      result.activityId,
      result.activityName,
      JSON.stringify(result),
      result.createdAt,
    ]
  );
};

export const getFullResultsLocal = async () => {
  await setupLocalResultDatabase();

  const rows = await db.getAllAsync<{
    id: number;
    activityId: string;
    activityName: string;
    fullResultJson: string;
    createdAt: string;
  }>(`
    SELECT *
    FROM activity_results
    ORDER BY createdAt DESC
    LIMIT 50
  `);

  return rows.map((row) => ({
    id: row.id,
    ...JSON.parse(row.fullResultJson),
  }));
};

export const deleteFullResultLocal = async (id: number) => {
  await setupLocalResultDatabase();

  await db.runAsync(
    `
    DELETE FROM activity_results
    WHERE id = ?
    `,
    [id]
  );
};

export const clearAllFullResultsLocal = async () => {
  await setupLocalResultDatabase();

  await db.runAsync(`
    DELETE FROM activity_results
  `);
};