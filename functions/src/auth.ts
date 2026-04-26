import * as admin from 'firebase-admin';
import type { Request } from 'firebase-functions/v2/https';

export async function requireAdmin(req: Request): Promise<string> {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!token) throw new Error('NO_AUTH');
  const decoded = await admin.auth().verifyIdToken(token);
  const adminDoc = await admin.firestore().doc(`admins/${decoded.uid}`).get();
  if (!adminDoc.exists) throw new Error('NOT_ADMIN');
  return decoded.uid;
}

export function cors(res: any) {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}
