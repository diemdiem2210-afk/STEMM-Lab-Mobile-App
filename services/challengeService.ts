import AsyncStorage from "@react-native-async-storage/async-storage";

const CHALLENGE_KEY = "stemm_challenge";

export const TOTAL_ACTIVITIES = 7;

export type ChallengeState = {
  accepted: boolean;
  startedAt: string | null;
  completedAt: string | null;
  completedActivityIds: string[];
};

const defaultState: ChallengeState = {
  accepted: false,
  startedAt: null,
  completedAt: null,
  completedActivityIds: [],
};

export const getChallengeState = async (): Promise<ChallengeState> => {
  const saved = await AsyncStorage.getItem(CHALLENGE_KEY);
  return saved ? JSON.parse(saved) : defaultState;
};

export const startChallenge = async () => {
  const state: ChallengeState = {
    accepted: true,
    startedAt: new Date().toISOString(),
    completedAt: null,
    completedActivityIds: [],
  };

  await AsyncStorage.setItem(CHALLENGE_KEY, JSON.stringify(state));
  return state;
};

export const markActivityCompleted = async (activityId: string) => {
  const state = await getChallengeState();

  if (!state.accepted || state.completedAt) {
    return state;
  }

  const completed = Array.from(
    new Set([...state.completedActivityIds, activityId])
  );

  const updated: ChallengeState = {
    ...state,
    completedActivityIds: completed,
    completedAt:
      completed.length >= TOTAL_ACTIVITIES
        ? new Date().toISOString()
        : null,
  };

  await AsyncStorage.setItem(CHALLENGE_KEY, JSON.stringify(updated));
  return updated;
};

export const resetChallenge = async () => {
  await AsyncStorage.setItem(CHALLENGE_KEY, JSON.stringify(defaultState));
};