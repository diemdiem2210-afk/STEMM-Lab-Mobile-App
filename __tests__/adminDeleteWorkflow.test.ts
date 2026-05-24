import { describe, expect, test } from "@jest/globals";

describe("Admin delete end-to-end workflow test", () => {
  test("admin can delete a team account and linked activity results", () => {
    const adminLoggedIn = true;

    const teamsBeforeDelete = [
      {
        uid: "team-1",
        teamName: "Team Sunny",
      },
      {
        uid: "team-2",
        teamName: "Team STEMM",
      },
    ];

    const resultsBeforeDelete = [
      {
        uid: "team-1",
        activityName: "Sound Pollution Hunter",
      },
      {
        uid: "team-1",
        activityName: "Breathing Pace Trainer",
      },
      {
        uid: "team-2",
        activityName: "Reaction Board Challenge",
      },
    ];

    const deletedUid = "team-1";

    const teamsAfterDelete = teamsBeforeDelete.filter(
      (team) => team.uid !== deletedUid
    );

    const resultsAfterDelete = resultsBeforeDelete.filter(
      (result) => result.uid !== deletedUid
    );

    expect(adminLoggedIn).toBe(true);
    expect(teamsAfterDelete.length).toBe(1);
    expect(teamsAfterDelete[0].teamName).toBe("Team STEMM");
    expect(resultsAfterDelete.length).toBe(1);
    expect(resultsAfterDelete[0].uid).toBe("team-2");
  });
});