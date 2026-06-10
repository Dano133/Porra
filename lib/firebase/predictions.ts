"use client";

import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import type { GroupPredictionsMap } from "@/lib/world-cup/standings";

export type PredictionStatus = "draft" | "submitted" | "locked";

type PredictionPayload = {
  groupPredictions: GroupPredictionsMap;
  knockoutPredictions?: unknown | null;
  champion?: string | null;
  pichichi?: string | null;
  calculatedSnapshot?: unknown | null;
};

type SaveArgs = {
  uid: string;
  email: string | null;
  displayName: string | null;
  payload: PredictionPayload;
};

export type UserPredictionDocument = {
  userId: string;
  email: string | null;
  displayName: string | null;
  tournamentId: "world-cup-2026";
  status: PredictionStatus;
  groupPredictions: GroupPredictionsMap;
  knockoutPredictions: unknown | null;
  champion: string | null;
  pichichi?: string | null;
  calculatedSnapshot: unknown | null;
  version: 1;
  createdAt: unknown;
  updatedAt: unknown;
  submittedAt: unknown | null;
  lockedAt: null;
};

export async function getUserPrediction(uid: string) {
  const snap = await getDoc(doc(db, "predictions", uid));
  return snap.exists() ? (snap.data() as UserPredictionDocument) : null;
}

export async function saveUserPredictionDraft({
  uid,
  email,
  displayName,
  payload,
}: SaveArgs) {
  const predictionRef = doc(db, "predictions", uid);
  const existingPrediction = await getDoc(predictionRef);
  const existingData = existingPrediction.exists()
    ? (existingPrediction.data() as UserPredictionDocument)
    : null;

  if (
    existingData?.status === "submitted" ||
    existingData?.status === "locked"
  ) {
    throw new Error("Esta porra ya fue enviada y no se puede modificar.");
  }

  await setDoc(
    predictionRef,
    {
      userId: uid,
      email,
      displayName,
      tournamentId: "world-cup-2026",
      status: "draft",
      groupPredictions: payload.groupPredictions,
      knockoutPredictions: payload.knockoutPredictions ?? null,
      champion: payload.champion ?? null,
      pichichi: payload.pichichi ?? null,
      calculatedSnapshot: payload.calculatedSnapshot ?? null,
      version: 1,
      createdAt: existingData?.createdAt ?? serverTimestamp(),
      updatedAt: serverTimestamp(),
      submittedAt: null,
      lockedAt: null,
    },
    { merge: true },
  );
}

export async function submitUserPrediction({
  uid,
  email,
  displayName,
  payload,
}: SaveArgs) {
  const predictionRef = doc(db, "predictions", uid);
  const existingPrediction = await getDoc(predictionRef);
  const existingData = existingPrediction.exists()
    ? (existingPrediction.data() as UserPredictionDocument)
    : null;

  if (
    existingData?.status === "submitted" ||
    existingData?.status === "locked"
  ) {
    throw new Error("Esta porra ya fue enviada y no se puede volver a enviar.");
  }

  await setDoc(
    predictionRef,
    {
      userId: uid,
      email,
      displayName,
      tournamentId: "world-cup-2026",
      status: "submitted",
      groupPredictions: payload.groupPredictions,
      knockoutPredictions: payload.knockoutPredictions ?? null,
      champion: payload.champion ?? null,
      pichichi: payload.pichichi ?? null,
      calculatedSnapshot: payload.calculatedSnapshot ?? null,
      version: 1,
      createdAt: existingData?.createdAt ?? serverTimestamp(),
      updatedAt: serverTimestamp(),
      submittedAt: serverTimestamp(),
      lockedAt: null,
    },
    { merge: true },
  );
}
