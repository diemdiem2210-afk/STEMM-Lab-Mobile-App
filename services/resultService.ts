import {
  addDoc,
  collection,
  getDocs,
  limit,
  orderBy,
  query,
} from "firebase/firestore";

import { ActivityResult } from "../models/resultModel";
import { db } from "./firebase";

export const saveResultToFirestore = async (
  result: ActivityResult
) => {
  try {
    const docRef = await addDoc(collection(db, "results"), result);
    return docRef.id;
  } catch (error) {
    console.error("Save result error:", error);
    throw error;
  }
};

export const addFakeResults = async () => {
  try {
    for (let i = 1; i <= 21; i++) {
      await addDoc(collection(db, "results"), {
        username: `Test User ${i}`,
        activityName: "Tap Dominant",
        score: Math.floor(Math.random() * 100),
      });
    }

    console.log("21 fake results added");
  } catch (error) {
    console.error("Fake result error:", error);
  }
};

export const getTopResults = async () => {
  try {
    await addFakeResults();

    const q = query(
      collection(db, "results"),
      orderBy("score", "desc"),
      limit(20)
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Get top results error:", error);
    throw error;
  }
};