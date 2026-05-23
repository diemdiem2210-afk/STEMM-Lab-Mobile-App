import { createResult } from "../models/resultModel";

describe("Firestore result integration data", () => {
  test("creates result data ready for Firestore saving", () => {
    const result = createResult(
      "reaction",
      "Reaction Test",
      "user123",
      "Tony",
      95,
      "Integration test result"
    );

    expect(result).toMatchObject({
      activityId: "reaction",
      activityName: "Reaction Test",
      userId: "user123",
      username: "Tony",
      score: 95,
      notes: "Integration test result",
    });
  });
});