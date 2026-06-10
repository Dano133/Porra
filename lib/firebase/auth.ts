"use client";
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "./client";

async function ensureUserProfile(user: User) {
  const userRef = doc(db, "users", user.uid);
  const existingUser = await getDoc(userRef);

  await setDoc(
    userRef,
    {
      uid: user.uid,
      email: user.email ?? null,
      displayName: user.displayName ?? null,
      photoURL: user.photoURL ?? null,
      authProvider: user.providerData[0]?.providerId ?? "password",
      updatedAt: serverTimestamp(),
      createdAt: existingUser.exists()
        ? existingUser.data().createdAt
        : serverTimestamp(),
    },
    { merge: true },
  );
}

export async function registerWithEmail(
  email: string,
  password: string,
  displayName?: string,
) {
  const credential = await createUserWithEmailAndPassword(
    auth,
    email,
    password,
  );
  if (displayName?.trim())
    await updateProfile(credential.user, { displayName: displayName.trim() });
  await ensureUserProfile(credential.user);
  return credential.user;
}

export async function loginWithEmail(email: string, password: string) {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  await ensureUserProfile(credential.user);
  return credential.user;
}

export async function loginWithGoogle() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  const credential = await signInWithPopup(auth, provider);
  await ensureUserProfile(credential.user);
  return credential.user;
}

export async function logout() {
  await signOut(auth);
}
