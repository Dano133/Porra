import { onRequest } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';
import { z } from 'zod';
import { cors } from './auth';
import { sendMail, welcomeTemplate } from './email';

const Schema = z.object({
  fullName: z.string().trim().min(2).max(80),
  email: z.string().trim().toLowerCase().email().max(200),
  consentEmails: z.boolean().optional().default(true),
});

export const registerParticipant = onRequest({ cors: true }, async (req, res) => {
  cors(res);
  if (req.method === 'OPTIONS') { res.status(204).send(''); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }
  try {
    const data = Schema.parse(req.body);
    const db = admin.firestore();

    // Email único
    const dup = await db.collection('participants').where('email', '==', data.email).limit(1).get();
    if (!dup.empty) { res.status(409).json({ error: 'Ese correo ya está registrado.' }); return; }

    const ref = db.collection('participants').doc();
    const now = Date.now();
    await ref.set({
      id: ref.id,
      fullName: data.fullName,
      email: data.email,
      consentEmails: data.consentEmails,
      status: 'active',
      createdAt: now,
      updatedAt: now,
    });

    const siteUrl = process.env.SITE_URL || 'https://example.com';
    try { await sendMail(data.email, '¡Bienvenido/a a la Porra del Mundial!', welcomeTemplate(data.fullName, siteUrl)); }
    catch (e) { console.error('email error', e); }

    res.json({ ok: true, id: ref.id });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});
