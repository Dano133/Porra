/**
 * Crea el primer admin.
 * Uso:
 *   1. Descarga la clave de servicio de Firebase (JSON) desde:
 *      Configuración del proyecto > Cuentas de servicio > Generar nueva clave privada
 *   2. Guárdala como `serviceAccountKey.json` en la raíz del proyecto.
 *   3. Ejecuta:
 *      npx tsx scripts/create-admin.ts admin@tudominio.com TuPasswordSegura "Tu Nombre"
 */
import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';

const [, , email, password, name] = process.argv;
if (!email || !password) {
  console.error('Uso: tsx scripts/create-admin.ts <email> <password> [nombre]');
  process.exit(1);
}

const keyPath = path.join(process.cwd(), 'serviceAccountKey.json');
if (!fs.existsSync(keyPath)) {
  console.error('Falta serviceAccountKey.json en la raíz.');
  process.exit(1);
}
admin.initializeApp({ credential: admin.credential.cert(JSON.parse(fs.readFileSync(keyPath, 'utf8'))) });

(async () => {
  let user;
  try {
    user = await admin.auth().getUserByEmail(email);
    await admin.auth().updateUser(user.uid, { password, displayName: name });
  } catch {
    user = await admin.auth().createUser({ email, password, displayName: name });
  }
  await admin.firestore().doc(`admins/${user.uid}`).set({
    uid: user.uid, email, role: 'superadmin', createdAt: Date.now(),
  });
  console.log(`✅ Admin creado: ${email} (uid: ${user.uid})`);
  process.exit(0);
})();
