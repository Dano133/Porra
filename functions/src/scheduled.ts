import { onSchedule } from 'firebase-functions/v2/scheduler';
import * as admin from 'firebase-admin';
import { sendMail, biweeklyTemplate } from './email';

// Snapshot diario a las 03:00 Madrid
export const dailySnapshot = onSchedule({ schedule: '0 3 * * *', timeZone: 'Europe/Madrid' }, async () => {
  const db = admin.firestore();
  const settings = (await db.doc('settings/global').get()).data() as any;
  const tournamentId = settings?.currentTournamentId || 'mundial-2026';
  const today = new Date().toISOString().slice(0, 10);

  const scoresSnap = await db.collection('scores')
    .where('tournamentId','==',tournamentId).orderBy('totalPoints','desc').get();

  // Snapshot anterior para deltas
  const prevSnap = await db.collection('rankingSnapshots')
    .where('tournamentId','==',tournamentId).orderBy('snapshotDate','desc').limit(500).get();
  const prevDate = prevSnap.docs[0]?.data().snapshotDate;
  const prevByPid = new Map<string, number>();
  prevSnap.docs.forEach(d => { const v = d.data() as any; if (v.snapshotDate === prevDate) prevByPid.set(v.participantId, v.rank); });

  const batch = db.batch();
  scoresSnap.docs.forEach((doc, i) => {
    const s = doc.data() as any;
    const rank = i + 1;
    const prevRank = prevByPid.get(s.participantId) ?? rank;
    const ref = db.collection('rankingSnapshots').doc(`${today}_${s.participantId}`);
    batch.set(ref, {
      id: `${today}_${s.participantId}`,
      snapshotDate: today,
      participantId: s.participantId,
      tournamentId,
      totalPoints: s.totalPoints,
      rank,
      delta: prevRank - rank, // positivo = ha subido
      createdAt: Date.now(),
    });
  });
  await batch.commit();
});

// Email quincenal: días 1 y 15 a las 09:00 Madrid
export const biweeklyEmail = onSchedule({ schedule: '0 9 1,15 * *', timeZone: 'Europe/Madrid' }, async () => {
  const db = admin.firestore();
  const settings = (await db.doc('settings/global').get()).data() as any;
  if (!settings?.emailUpdatesEnabled) return;
  const siteUrl = process.env.SITE_URL || 'https://example.com';
  const partsSnap = await db.collection('participants')
    .where('status','==','active').where('consentEmails','==',true).get();
  const scoresSnap = await db.collection('scores').orderBy('totalPoints','desc').get();
  const ranking = scoresSnap.docs.map(d => d.data() as any);
  const positionByPid = new Map(ranking.map((r, i) => [r.participantId, { pos: i + 1, pts: r.totalPoints }]));

  for (const doc of partsSnap.docs) {
    const p = doc.data() as any;
    const info = positionByPid.get(p.id) || { pos: 0, pts: 0 };
    try { await sendMail(p.email, 'Tu actualización quincenal', biweeklyTemplate(p.fullName, info.pos, info.pts, siteUrl)); }
    catch (e) { console.error(e); }
  }
  const logRef = db.collection('mailLogs').doc();
  await logRef.set({ id: logRef.id, type: 'biweekly', subject: 'Tu actualización quincenal',
    sentAt: Date.now(), recipientsCount: partsSnap.size, status: 'sent' });
});
