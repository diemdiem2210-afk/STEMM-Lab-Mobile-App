import { createResult } from "../models/resultModel";

describe("createResult", () => {
  test("creates a valid activity result object", () => {
    const result = createResult(
      "reaction",
      "Reaction Test",
      "user123",
      "Tony",
      95,
      "Great reaction speed"
    );

    expect(result.activityId).toBe("reaction");
    expect(result.activityName).toBe("Reaction Test");
    expect(result.userId).toBe("user123");
    expect(result.username).toBe("Tony");
    expect(result.score).toBe(95);
    expect(result.notes).toBe("Great reaction speed");
    expect(result.createdAt).toBeDefined();
  });
});