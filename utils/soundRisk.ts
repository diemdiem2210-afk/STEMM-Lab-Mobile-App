export type SoundRisk = {
  label: string;
  color: string;
  advice: string;
};

export const getSoundRisk = (db: number): SoundRisk => {
  if (db < 60) {
    return {
      label: "Safe",
      color: "#22c55e",
      advice:
        "This level is generally safe for normal classroom activity.",
    };
  }

  if (db < 85) {
    return {
      label: "Moderate",
      color: "#facc15",
      advice:
        "This level may affect concentration if it continues for a long time.",
    };
  }

  return {
    label: "High Risk",
    color: "#ef4444",
    advice:
      "This level may be unsafe for long exposure. Consider reducing noise.",
  };
};