export type ActivityResult = {
  id?: string;
  activityId: string;
  activityName: string;
  userId: string;
  username: string;
  score: number;
  notes?: string;
  createdAt: string;
};

export const createResult = (
  activityId: string,
  activityName: string,
  userId: string,
  username: string,
  score: number,
  notes: string = ""
): ActivityResult => {
  return {
    activityId,
    activityName,
    userId,
    username,
    score,
    notes,
    createdAt: new Date().toISOString(),
  };
};