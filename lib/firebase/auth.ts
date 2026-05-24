'use client';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth';
import { auth } from './client';

export async function registerWithEmail(email: string, password: string, displayName?: string) {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  if (displayName?.trim()) await updateProfile(credential.user, { displayName: displayName.trim() });
  return credential.user;
}

export async function loginWithEmail(email: string, password: string) {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

export async function logout() { await signOut(auth); }
