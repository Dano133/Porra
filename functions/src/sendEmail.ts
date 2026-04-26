import { onRequest } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';
import { cors, requireAdmin } from './auth';
import { sendMail, biweeklyTemplate } from './email';

export const sendEmail = onRequest({ cors: true }, async (req, res) => {
  cors(res);
  if (req.method === 'OPTIONS') { res.status(204).send(''); return; }
  try { await requireAdmin(req); }
  catch { res.status(401).json({ error: 'No autorizado' }); return; }

  const { kind, subject, body, testRecipient } = req.body as any;
  const db = admin.firestore();
  const siteUrl = process.env.SITE_URL || 'https://example.com';

  let recipients: string[] = [];
  let html = body || '';
  const finalSubject = subject || 'Porra del Mundial';

  if (kind === 'test') {
    if (!testRecipient) { res.status(400).json({ error: 'Falta destinatario de prueba' }); return; }
    recipients = [testRecipient];
  } else {
    const partsSnap = await db.collection('participants')
      .where('status','==','active').where('consentEmails','==',true).get();
    const parts = partsSnap.docs.map(d => d.data() as any);
    if (kind === 'biweekly') {
      const scoresSnap = await db.collection('scores').orderBy('totalPoints','desc').get();
      const ranking = scoresSnap.docs.map(d => d.data() as any);
      const positionByPid = new Map(ranking.map((r, i) => [r.participantId, { pos: i + 1, pts: r.totalPoints }]));
      for (const p of parts) {
        const info = positionByPid.get(p.id) || { pos: 0, pts: 0 };
        try { await sendMail(p.email, finalSubject || 'Actualización quincenal',
          biweeklyTemplate(p.fullName, info.pos, info.pts, siteUrl)); } catch (e) { console.error(e); }
      }
      recipients = parts.map(p => p.email);
    } else {
      recipients = parts.map(p => p.email);
      for (const r of recipients) {
        try { await sendMail(r, finalSubject, html); } catch (e) { console.error(e); }
      }
    }
  }

  if (kind === 'test') {
    try { await sendMail(testRecipient, finalSubject, html); } catch (e) { console.error(e); }
  }

  const logRef = db.collection('mailLogs').doc();
  await logRef.set({
    id: logRef.id,
    type: kind, subject: finalSubject,
    sentAt: Date.now(), recipientsCount: recipients.length,
    status: 'sent',
  });
  res.json({ ok: true, recipientsCount: recipients.length });
});
