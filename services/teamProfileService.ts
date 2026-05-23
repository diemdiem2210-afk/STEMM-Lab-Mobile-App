import AsyncStorage from "@react-native-async-storage/async-storage";
import { TeamProfile } from "../models/teamProfileModel";

const TEAM_PROFILE_KEY = "team_profile";

export const saveTeamProfile = async (profile: TeamProfile) => {
  await AsyncStorage.setItem(TEAM_PROFILE_KEY, JSON.stringify(profile));
};

export const getTeamProfile = async (): Promise<TeamProfile | null> => {
  const saved = await AsyncStorage.getItem(TEAM_PROFILE_KEY);

  if (!saved) {
    return null;
  }

  return JSON.parse(saved);
};

export const clearTeamProfile = async () => {
  await AsyncStorage.removeItem(TEAM_PROFILE_KEY);
};