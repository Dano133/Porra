# Guía de despliegue paso a paso

## 1. Local

```bash
git clone <tu-repo>
cd porra-mundial
npm install
cd functions && npm install && cd ..
cp .env.example .env.local   # rellena con tus credenciales Firebase
npm run dev
```

## 2. Firebase

```bash
npm install -g firebase-tools
firebase login
# Edita .firebaserc → reemplaza REEMPLAZA-CON-TU-PROJECT-ID
firebase functions:config:set resend.api_key="re_xxx" email.from="Porra <noreply@tu.com>"

npm run deploy:rules
npm run deploy:functions
npm run build
firebase deploy --only hosting
```

## 3. Producción

```bash
# 1. Crear admin inicial
npx tsx scripts/create-admin.ts admin@tu.com Password "Admin"

# 2. Cargar datos iniciales (torneo + settings + partidos)
npx tsx scripts/seed.ts

# 3. Verifica:
#    - https://TU-PROJECT-ID.web.app/registro       (registro funciona)
#    - https://TU-PROJECT-ID.web.app/admin          (login admin)
#    - panel admin → Configuración → ajusta fecha límite
#    - panel admin → Emails → envía email de prueba
```
