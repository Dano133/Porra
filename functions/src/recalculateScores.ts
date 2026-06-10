import { onRequest } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { cors, requireAdmin } from "./auth";
import { computeScore } from "./shared/scoring";
import type { Match, Prediction } from "./shared/types";

export const recalculateScores = onRequest({ cors: true }, async (req, res) => {
  cors(res);
  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }
  try {
    await requireAdmin(req);
  } catch {
    res.status(401).json({ error: "No autorizado" });
    return;
  }

  const db = admin.firestore();
  const settings = (await db.doc("settings/global").get()).data() as any;
  const tournamentId = settings.currentTournamentId;

  const matchesSnap = await db
    .collection("matches")
    .where("tournamentId", "==", tournamentId)
    .get();
  const matches: Match[] = matchesSnap.docs.map((d) => d.data() as Match);

  // Campeón real: ganador de la final
  const finalMatch = matches.find(
    (m) => m.stage === "final" && m.status === "finished",
  );
  let realChampion: string | null = null;
  if (
    finalMatch &&
    finalMatch.winnerAfter90Or120 &&
    finalMatch.winnerAfter90Or120 !== "draw"
  ) {
    realChampion =
      finalMatch.winnerAfter90Or120 === "home"
        ? finalMatch.homeTeam
        : finalMatch.awayTeam;
  }

  const realResultsSnap = await db.doc(`results/${tournamentId}`).get();
  const realPichichi =
    (realResultsSnap.data()?.pichichi as string | undefined) || null;

  const predsSnap = await db
    .collection("predictions")
    .where("tournamentId", "==", tournamentId)
    .get();
  const partsSnap = await db.collection("participants").get();
  const partsById = new Map(partsSnap.docs.map((d) => [d.id, d.data() as any]));

  const batch = db.batch();
  let n = 0;
  for (const d of predsSnap.docs) {
    const pred = d.data() as Prediction;
    if (pred.status === "cancelled" || pred.status === "draft") continue;
    const result = computeScore(pred, matches, realChampion, realPichichi);
    const participantId = pred.participantId || pred.userId || d.id;
    const part = partsById.get(participantId);
    const ref = db.doc(`scores/${participantId}_${pred.tournamentId}`);
    batch.set(ref, {
      id: `${participantId}_${pred.tournamentId}`,
      participantId,
      tournamentId: pred.tournamentId,
      totalPoints: result.totalPoints,
      breakdown: result.breakdown,
      fullName:
        part?.fullName || pred.displayName || pred.email || "Participante", // denormalizado para ranking público
      updatedAt: Date.now(),
    });
    n++;
  }
  await batch.commit();
  res.json({ ok: true, processed: n });
});
