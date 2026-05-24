export type TeamProfile = {
  uid: string;
  email: string;
  teamName: string;
  members: string[];
  yearLevel: string;
  teamDiscriminator: string;
  createdAt: string;

  challengeAccepted?: boolean;
  challengeStartedAt?: string | null;
  challengeCompletedAt?: string | null;
  completedActivityIds?: string[];
};

export const createTeamProfile = (
  uid: string,
  email: string,
  teamName: string,
  members: string[],
  yearLevel: string
): TeamProfile => {
  const randomCode = Math.floor(1000 + Math.random() * 9000);

  return {
    uid,
    email,
    teamName,
    members,
    yearLevel,

    challengeAccepted: false,
    challengeStartedAt: null,
    challengeCompletedAt: null,
    completedActivityIds: [],

    teamDiscriminator: `TEAM-${randomCode}`,
    createdAt: new Date().toISOString(),
  };
};