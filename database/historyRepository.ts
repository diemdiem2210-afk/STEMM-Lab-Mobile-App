import { ActivityResult } from "../models/resultModel";
import { db } from "./sqlite";

export const saveResultLocal = async (
  result: ActivityResult
) => {
  try {
    await db.runAsync(
      `
      INSERT INTO results (
        activityId,
        activityName,
        userId,
        username,
        score,
        notes,
        createdAt
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        result.activityId,
        result.activityName,
        result.userId,
        result.username,
        result.score,
        result.notes ?? "",
        result.createdAt,
      ]
    );

    console.log("Saved locally");
  } catch (error) {
    console.error("SQLite save error:", error);
  }
};

export const getLocalResults = async () => {
  try {
    const results = await db.getAllAsync(
      `
      SELECT * FROM results
      ORDER BY createdAt DESC
      `
    );

    return results;
  } catch (error) {
    console.error("SQLite fetch error:", error);
    return [];
  }
};