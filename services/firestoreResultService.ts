import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDocs,
    query,
    where,
} from "firebase/firestore";

import { auth, db } from "@/services/firebase";

export const saveFullResultCloud = async (result: any) => {
  const user = auth.currentUser;

  if (!user) {
    console.log("No Firebase user logged in. Cloud save skipped.");
    return null;
  }

  const cloudResult = {
    uid: user.uid,
    email: user.email,
    ...result,
  };

  const docRef = await addDoc(
    collection(db, "activity_results"),
    cloudResult
  );

  return docRef.id;
};

export const getCloudResultsForCurrentUser = async () => {
  const user = auth.currentUser;

  if (!user) {
    return [];
  }

  const q = query(
    collection(db, "activity_results"),
    where("uid", "==", user.uid)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  }));
};

export const deleteCloudResult = async (id: string) => {
  await deleteDoc(doc(db, "activity_results", id));
};