import { onRequest } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';
import { z } from 'zod';
import { cors } from './auth';
import { sendMail, confirmationTemplate } from './email';

const GroupPredSchema = z.object({
  matchId: z.string(),
  homeScore: z.number().int().min(0).max(20),
  awayScore: z.number().int().min(0).max(20),
});
const KoPredSchema = z.object({
  bracketId: z.string(),
  stage: z.enum(['round_of_16','quarter_final','semi_final','third_place','final']),
  homeTeam: z.string(),
  awayTeam: z.string(),
  homeScore: z.number().int().min(0).max(20),
  awayScore: z.number().int().min(0).max(20),
  winnerTeamId: z.string().max(60).optional(),
});
const Schema = z.object({
  email: z.string().trim().toLowerCase().email(),
  asDraft: z.boolean(),
  groupStagePredictions: z.array(GroupPredSchema).default([]),
  knockoutPredictions: z.array(KoPredSchema).default([]),
  championPrediction: z.string().max(60).optional().default(''),
});

export const submitPrediction = onRequest({ cors: true }, async (req, res) => {
  cors(res);
  if (req.method === 'OPTIONS') { res.status(204).send(''); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }
  try {
    const data = Schema.parse(req.body);
    const db = admin.firestore();
    const settingsSnap = await db.doc('settings/global').get();
    if (!settingsSnap.exists) { res.status(500).json({ error: 'Settings no inicializados' }); return; }
    const settings = settingsSnap.data() as any;
    const tournamentId: string = settings.currentTournamentId;
    const closed = Date.now() > settings.predictionDeadline;

    const pSnap = await db.collection('participants').where('email', '==', data.email).limit(1).get();
    if (pSnap.empty) { res.status(404).json({ error: 'No estás registrado.' }); return; }
    const participant = pSnap.docs[0].data() as any;
    if (participant.status === 'blocked') { res.status(403).json({ error: 'Cuenta bloqueada.' }); return; }

    const id = `${participant.id}_${tournamentId}`;
    const existing = await db.doc(`predictions/${id}`).get();
    if (existing.exists) {
      const cur = existing.data() as any;
      if (cur.status === 'locked' || cur.status === 'cancelled' || closed) {
        res.status(403).json({ error: 'El plazo está cerrado o tu porra está bloqueada.' });
        return;
      }
    }

    const newStatus = closed ? 'locked' : data.asDraft ? 'draft' : 'submitted';
    const now = Date.now();
    await db.doc(`predictions/${id}`).set({
      id, participantId: participant.id, tournamentId,
      status: newStatus,
      groupStagePredictions: data.groupStagePredictions,
      knockoutPredictions: data.knockoutPredictions,
      championPrediction: data.championPrediction,
      submittedAt: newStatus === 'submitted' ? now : (existing.data() as any)?.submittedAt,
      updatedAt: now,
      lockedAt: newStatus === 'locked' ? now : null,
    }, { merge: true });

    if (newStatus === 'submitted') {
      const siteUrl = process.env.SITE_URL || 'https://example.com';
      try { await sendMail(participant.email, 'Porra recibida', confirmationTemplate(participant.fullName, siteUrl)); }
      catch (e) { console.error('email', e); }
    }

    res.json({ ok: true, status: newStatus });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});
