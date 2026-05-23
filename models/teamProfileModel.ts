export type TeamProfile = {
  teamName: string;
  members: string[];
  yearLevel: string;
  teamDiscriminator: string;
  createdAt: string;
};

export const createTeamProfile = (
  teamName: string,
  members: string[],
  yearLevel: string
): TeamProfile => {
  const randomCode = Math.floor(1000 + Math.random() * 9000);

  return {
    teamName,
    members,
    yearLevel,
    teamDiscriminator: `TEAM-${randomCode}`,
    createdAt: new Date().toISOString(),
  };
};