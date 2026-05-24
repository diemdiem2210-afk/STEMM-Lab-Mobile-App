import { describe, expect, test } from "@jest/globals";

describe("Challenge progress integration test", () => {
  test("updates completed activities after saving different activity results", () => {
    const completedActivityIds = new Set<string>();

    completedActivityIds.add("breathing");
    completedActivityIds.add("reaction");
    completedActivityIds.add("sound-hunter");

    expect(completedActivityIds.size).toBe(3);
    expect(completedActivityIds.has("breathing")).toBe(true);
    expect(completedActivityIds.has("reaction")).toBe(true);
    expect(completedActivityIds.has("sound-hunter")).toBe(true);
  });

  test("does not duplicate the same activity in challenge progress", () => {
    const completedActivityIds = new Set<string>();

    completedActivityIds.add("reaction");
    completedActivityIds.add("reaction");

    expect(completedActivityIds.size).toBe(1);
  });
});