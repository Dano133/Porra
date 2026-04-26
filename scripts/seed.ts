/**
 * Carga datos de ejemplo en Firestore (torneo, settings, partidos, participantes y predicciones).
 * Requiere serviceAccountKey.json en la raíz.
 *   npx tsx scripts/seed.ts
 */
import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';

admin.initializeApp({
  credential: admin.credential.cert(JSON.parse(fs.readFileSync(path.join(process.cwd(),'serviceAccountKey.json'),'utf8'))),
});
const db = admin.firestore();
const TOURNAMENT_ID = 'mundial-2026';

async function main() {
  console.log('Cargando datos de ejemplo…');

  await db.doc(`tournaments/${TOURNAMENT_ID}`).set({
    id: TOURNAMENT_ID, name: 'Mundial 2026', slug: 'mundial-2026', year: 2026,
    status: 'upcoming', createdAt: Date.now(), updatedAt: Date.now(),
  });

  await db.doc('settings/global').set({
    competitionName: 'Mundial 2026',
    predictionDeadline: Date.now() + 30 * 24 * 3600 * 1000,
    publicLeaderboardEnabled: true, emailUpdatesEnabled: true,
    senderName: 'Porra del Mundial', senderEmail: 'noreply@example.com',
    currentTournamentId: TOURNAMENT_ID,
    createdAt: Date.now(), updatedAt: Date.now(),
  });

  // Algunos partidos de fase de grupos (ejemplo Grupo A)
  const matches = [
    { id: 'GA1', stage: 'group', group: 'A', homeTeam: 'México', awayTeam: 'Polonia' },
    { id: 'GA2', stage: 'group', group: 'A', homeTeam: 'Argentina', awayTeam: 'Arabia Saudita' },
    { id: 'GA3', stage: 'group', group: 'A', homeTeam: 'México', awayTeam: 'Argentina' },
    { id: 'GA4', stage: 'group', group: 'A', homeTeam: 'Polonia', awayTeam: 'Arabia Saudita' },
    { id: 'GB1', stage: 'group', group: 'B', homeTeam: 'España', awayTeam: 'Croacia' },
    { id: 'GB2', stage: 'group', group: 'B', homeTeam: 'Alemania', awayTeam: 'Japón' },
    // Eliminatorias de ejemplo
    { id: 'R16_1', stage: 'round_of_16', bracketId: 'R16_1', homeTeam: 'TBD', awayTeam: 'TBD' },
    { id: 'FINAL', stage: 'final', bracketId: 'FINAL', homeTeam: 'TBD', awayTeam: 'TBD' },
  ];
  for (const m of matches) {
    await db.doc(`matches/${m.id}`).set({
      ...m, tournamentId: TOURNAMENT_ID,
      kickoffAt: Date.now() + Math.random() * 60 * 24 * 3600 * 1000,
      officialHomeScore: null, officialAwayScore: null, winnerAfter90Or120: null,
      status: 'scheduled', updatedAt: Date.now(),
    });
  }

  // Participantes de ejemplo
  const sample = [
    { fullName: 'Ana García',  email: 'ana@example.com' },
    { fullName: 'Luis Pérez',  email: 'luis@example.com' },
    { fullName: 'María López', email: 'maria@example.com' },
  ];
  for (const p of sample) {
    const ref = db.collection('participants').doc();
    await ref.set({ id: ref.id, ...p, consentEmails: true, status: 'active',
      createdAt: Date.now(), updatedAt: Date.now() });
  }

  console.log('✅ Seed completado.');
  process.exit(0);
}
main().catch(e => { console.error(e); process.exit(1); });
