import { describe, expect, test } from "@jest/globals";
import { getSoundRisk } from "../utils/soundRisk";

describe("Sound Hunter risk classification", () => {
  test("returns Safe for sound below 60 dB", () => {
    expect(getSoundRisk(45).label).toBe("Safe");
  });

  test("returns Moderate for sound between 60 and 84 dB", () => {
    expect(getSoundRisk(70).label).toBe("Moderate");
  });

  test("returns High Risk for sound 85 dB or above", () => {
    expect(getSoundRisk(90).label).toBe("High Risk");
  });
});