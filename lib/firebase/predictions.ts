'use client';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from './client';

type PredictionPayload = {
  groupPredictions: unknown;
  knockoutPredictions?: unknown | null;
  champion?: string | null;
  calculatedSnapshot?: unknown | null;
};

type SaveArgs = {
  uid: string;
  email: string | null;
  displayName: string | null;
  payload: PredictionPayload;
};

export async function getUserPrediction(uid: string) {
  const snap = await getDoc(doc(db, 'predictions', uid));
  return snap.exists() ? snap.data() : null;
}

export async function saveUserPredictionDraft({ uid, email, displayName, payload }: SaveArgs) {
  await setDoc(doc(db, 'predictions', uid), {
    userId: uid,
    email,
    displayName,
    tournamentId: 'world-cup-2026',
    status: 'draft',
    groupPredictions: payload.groupPredictions,
    knockoutPredictions: payload.knockoutPredictions ?? null,
    champion: payload.champion ?? null,
    calculatedSnapshot: payload.calculatedSnapshot ?? null,
    version: 1,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

export async function submitUserPrediction({ uid, email, displayName, payload }: SaveArgs) {
  await setDoc(doc(db, 'predictions', uid), {
    userId: uid,
    email,
    displayName,
    tournamentId: 'world-cup-2026',
    status: 'submitted',
    groupPredictions: payload.groupPredictions,
    knockoutPredictions: payload.knockoutPredictions ?? null,
    champion: payload.champion ?? null,
    calculatedSnapshot: payload.calculatedSnapshot ?? null,
    version: 1,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    submittedAt: serverTimestamp(),
  }, { merge: true });
}
