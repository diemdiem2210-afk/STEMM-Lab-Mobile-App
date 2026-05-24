import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";

import { TeamProfile } from "@/models/teamProfileModel";
import { db } from "@/services/firebase";

export type FirestoreTeamProfile = TeamProfile & {
  id: string;
};

export const saveTeamProfileToFirestore = async (
  profile: TeamProfile
) => {
  await setDoc(doc(db, "users", profile.uid), profile);
};

export const getTeamProfileFromFirestore = async (uid: string) => {
  const snapshot = await getDoc(doc(db, "users", uid));

  if (!snapshot.exists()) {
    return null;
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
  } as FirestoreTeamProfile;
};

export const getAllTeamProfilesFromFirestore = async () => {
  const snapshot = await getDocs(collection(db, "users"));

  return snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  })) as FirestoreTeamProfile[];
};

export const startChallengeInFirestore = async (uid: string) => {
  const startedAt = new Date().toISOString();

  await updateDoc(doc(db, "users", uid), {
    challengeAccepted: true,
    challengeStartedAt: startedAt,
    challengeCompletedAt: null,
    completedActivityIds: [],
  });

  return startedAt;
};

export const markActivityCompletedInFirestore = async (
  uid: string,
  activityId: string
) => {
  const profile = await getTeamProfileFromFirestore(uid);

  if (!profile || !profile.challengeAccepted || profile.challengeCompletedAt) {
    return profile;
  }

  const completedActivityIds = Array.from(
    new Set([...(profile.completedActivityIds ?? []), activityId])
  );

  const challengeCompletedAt =
    completedActivityIds.length >= 7 ? new Date().toISOString() : null;

  await updateDoc(doc(db, "users", uid), {
    completedActivityIds,
    challengeCompletedAt,
  });

  return {
    ...profile,
    completedActivityIds,
    challengeCompletedAt,
  };
};

export const resetChallengeInFirestore = async (uid: string) => {
  await updateDoc(doc(db, "users", uid), {
    challengeAccepted: false,
    challengeStartedAt: null,
    challengeCompletedAt: null,
    completedActivityIds: [],
  });
};

export const deleteUserAndResultsFromFirestore = async (uid: string) => {
  const batch = writeBatch(db);

  batch.delete(doc(db, "users", uid));

  const resultsQuery = query(
    collection(db, "activity_results"),
    where("uid", "==", uid)
  );

  const resultSnapshot = await getDocs(resultsQuery);

  resultSnapshot.docs.forEach((resultDoc) => {
    batch.delete(resultDoc.ref);
  });

  await batch.commit();
};