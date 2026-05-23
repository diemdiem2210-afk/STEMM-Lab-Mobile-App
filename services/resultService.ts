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

export const getTopResults = async () => {
  try {
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