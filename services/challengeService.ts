import {
  markActivityCompletedInFirestore,
  resetChallengeInFirestore,
  startChallengeInFirestore,
} from "@/services/teamFirestoreService";
import { getTeamProfile } from "@/services/teamProfileService";
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
  const profile = await getTeamProfile();
  const startedAt = profile?.uid
    ? await startChallengeInFirestore(profile.uid)
    : new Date().toISOString();

  const state: ChallengeState = {
    accepted: true,
    startedAt,
    completedAt: null,
    completedActivityIds: [],
  };

  await AsyncStorage.setItem(CHALLENGE_KEY, JSON.stringify(state));
  return state;
};

export const markActivityCompleted = async (activityId: string) => {
  const profile = await getTeamProfile();
  const state = await getChallengeState();

  if (profile?.uid) {
    const cloudProfile = await markActivityCompletedInFirestore(
      profile.uid,
      activityId
    );

    const updated: ChallengeState = {
      accepted: cloudProfile?.challengeAccepted ?? state.accepted,
      startedAt: cloudProfile?.challengeStartedAt ?? state.startedAt,
      completedAt: cloudProfile?.challengeCompletedAt ?? null,
      completedActivityIds: cloudProfile?.completedActivityIds ?? [],
    };

    await AsyncStorage.setItem(CHALLENGE_KEY, JSON.stringify(updated));

    return updated;
  }

  if (!state.accepted || state.completedAt) {
    return state;
  }

  const completed = Array.from(
    new Set([...state.completedActivityIds, activityId])
  );

  const completedAt =
    completed.length >= TOTAL_ACTIVITIES ? new Date().toISOString() : null;

  const updated: ChallengeState = {
    ...state,
    completedActivityIds: completed,
    completedAt,
  };

  await AsyncStorage.setItem(CHALLENGE_KEY, JSON.stringify(updated));

  return updated;
};

export const resetChallenge = async () => {
  const profile = await getTeamProfile();

  await AsyncStorage.setItem(CHALLENGE_KEY, JSON.stringify(defaultState));

  if (profile?.uid) {
    await resetChallengeInFirestore(profile.uid);
  }
};