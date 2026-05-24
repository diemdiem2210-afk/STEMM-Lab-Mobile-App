import { describe, expect, test } from "@jest/globals";

const getBreathingDiagnosis = (
  testType: "resting" | "jogging" | "jumping",
  breathCount: number
) => {
  if (breathCount === 0) return "Not measured yet";

  if (testType === "resting") {
    if (breathCount < 12) return "Slow breathing";
    if (breathCount <= 20) return "Normal breathing";
    return "Heavy breathing";
  }

  if (testType === "jogging") {
    if (breathCount < 18) return "Low recovery breathing";
    if (breathCount <= 30) return "Normal after jogging";
    return "Heavy breathing";
  }

  if (breathCount < 25) return "Low recovery breathing";
  if (breathCount <= 40) return "Normal after jumping";
  return "Heavy breathing";
};

describe("Breathing diagnosis unit test", () => {
  test("returns Normal breathing for resting test with 16 breaths", () => {
    expect(getBreathingDiagnosis("resting", 16)).toBe("Normal breathing");
  });

  test("returns Heavy breathing for jumping test over 40 breaths", () => {
    expect(getBreathingDiagnosis("jumping", 45)).toBe("Heavy breathing");
  });
});