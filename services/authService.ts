import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
} from "firebase/auth";

import { auth } from "./firebase";

export const registerUser = async (
  email: string,
  password: string
) => {
  try {
    const userCredential =
      await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

    return userCredential.user;
  } catch (error) {
    console.error("Register Error:", error);
    throw error;
  }
};

export const loginUser = async (
  email: string,
  password: string
) => {
  try {
    const userCredential =
      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

    return userCredential.user;
  } catch (error) {
    console.error("Login Error:", error);
    throw error;
  }
};