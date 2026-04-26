# 🏆 Porra del Mundial

Aplicación web para gestionar una porra del Mundial: registro de participantes,
predicciones, cálculo automático de puntos, ranking público, panel de admin,
emails automáticos y snapshots diarios.

## Tecnologías

- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS (export estático)
- **Backend**: Firebase Cloud Functions (Node 20)
- **Base de datos**: Firestore
- **Auth**: Firebase Auth (solo para admins)
- **Hosting**: Firebase Hosting
- **Emails**: Resend (puedes cambiarlo a Brevo en `functions/src/email.ts`)
- **Programación**: Cloud Scheduler (snapshots y emails quincenales)

## Estructura

```
porra-mundial/
├── app/                  # Páginas Next.js (landing, registro, porra, ranking, admin)
├── components/           # UI reutilizable (Header, Footer)
├── lib/                  # Tipos, scoring, cliente Firebase
├── functions/            # Cloud Functions (backend)
│   └── src/
│       ├── shared/       # Copia compartida de tipos y motor de scoring
│       ├── registerParticipant.ts
│       ├── submitPrediction.ts
│       ├── recalculateScores.ts
│       ├── sendEmail.ts
│       └── scheduled.ts  # snapshot diario y email quincenal
├── scripts/
│   ├── create-admin.ts   # crea el primer admin
│   └── seed.ts           # carga datos de prueba
├── firebase.json
├── firestore.rules
├── firestore.indexes.json
└── .env.example
```

## Instalación local

```bash
# 1. Instalar dependencias
npm install
cd functions && npm install && cd ..

# 2. Copiar variables de entorno
cp .env.example .env.local
# Edita .env.local con los datos de tu proyecto Firebase

# 3. Arrancar Next.js en local
npm run dev
# → http://localhost:3000
```

## Configurar Firebase desde cero

### 1. Crear el proyecto

1. Ve a https://console.firebase.google.com → **Añadir proyecto**.
2. Pon nombre (ej. `porra-mundial`). Sin Analytics es suficiente.
3. Copia el **Project ID** (lo necesitas para `.firebaserc` y `.env.local`).

### 2. Activar servicios

En la consola de Firebase, activa:
- **Authentication** → método **Email/Password**.
- **Firestore Database** → modo **producción**, región `eur3` o `europe-west1`.
- **Hosting**.
- **Functions** (requiere plan Blaze de pago, pero el uso real es prácticamente gratis).
- **Cloud Scheduler** (se activa solo al desplegar las funciones programadas).

### 3. Crear app web y obtener credenciales

En **Configuración del proyecto → Tus apps → Web (</>)**, registra una app
y copia los valores en `.env.local` (`NEXT_PUBLIC_FIREBASE_*`).

### 4. Conectar el repo

```bash
npm install -g firebase-tools
firebase login
# Edita .firebaserc y reemplaza el project ID
firebase use --add
```

### 5. Configurar Resend

1. Crea cuenta en https://resend.com y verifica un dominio.
2. Genera una API key.
3. Configura las variables de Functions:

```bash
firebase functions:config:set resend.api_key="re_xxxxx" email.from="Porra <noreply@tudominio.com>"
```

### 6. Crear el primer admin

1. En la consola de Firebase → **Configuración → Cuentas de servicio →
   Generar nueva clave privada**. Guárdala en la raíz como
   `serviceAccountKey.json` (¡no la subas a git!).
2. Ejecuta:

```bash
npx tsx scripts/create-admin.ts admin@tudominio.com TuPassword "Tu Nombre"
```

### 7. Cargar datos de prueba

```bash
npx tsx scripts/seed.ts
```

## Despliegue

```bash
# Despliega reglas de Firestore (haz esto siempre tras cambiarlas)
npm run deploy:rules

# Despliega solo las Cloud Functions
npm run deploy:functions

# Despliega solo el frontend (hosting)
npm run deploy:hosting

# Despliega todo
npm run deploy
```

Después del primer despliegue:
- Tu web estará en `https://TU-PROJECT-ID.web.app`.
- Las funciones HTTPS estarán en `https://us-central1-TU-PROJECT-ID.cloudfunctions.net/<nombre>`.
- Si usas otra región, configura `NEXT_PUBLIC_FUNCTIONS_URL` en `.env.local`.

## Mantenimiento

- **Cargar resultados**: panel admin → Resultados → introduce marcadores → Guardar.
- **Recalcular puntos**: panel admin → Resultados → botón "Recalcular puntuaciones".
- **Enviar email manual**: panel admin → Emails.
- **Cambiar fecha límite**: panel admin → Configuración.
- **Snapshots diarios**: automáticos a las 03:00 (Madrid).
- **Email quincenal**: automático los días 1 y 15 a las 09:00 (Madrid).

## Decisiones técnicas tomadas

- **Una porra por participante y torneo** (id determinístico `participantId_tournamentId`).
- **El participante no inicia sesión**: el formulario usa el correo como identidad
  (validado contra el registro). Esto simplifica la UX.
- **El cálculo de puntos siempre se hace en backend** (Cloud Function
  `recalculateScores`). El cliente nunca calcula nada.
- **Ranking público lee de `scores`** ya calculadas (rápido, sin lógica en cliente).
- **Nombres denormalizados en `scores`** para que el ranking público no exponga
  emails ni necesite leer `participants` (cuyas reglas son privadas).
- **MVP de eliminatorias**: el modelo de datos y el motor de scoring soportan
  eliminatorias, pero la UI del participante muestra solo grupos y campeón.
  El admin puede cargar resultados de eliminatorias y, si crea una UI extendida
  para predicciones de eliminatorias, el motor las puntuará automáticamente.

## Variables de entorno

| Variable | Dónde | Descripción |
|---|---|---|
| `NEXT_PUBLIC_FIREBASE_*` | `.env.local` | Credenciales públicas del cliente Firebase |
| `NEXT_PUBLIC_SITE_URL` | `.env.local` | URL pública del sitio (para emails) |
| `NEXT_PUBLIC_FUNCTIONS_URL` | `.env.local` (opcional) | URL base de las Functions si usas región custom |
| `resend.api_key` | `firebase functions:config:set` | API key de Resend |
| `email.from` | `firebase functions:config:set` | Remitente de los emails |

## Soporte

Si algo falla:
- Revisa los logs de Functions: `firebase functions:log`
- Revisa los logs de email en el panel admin → Emails.
- Verifica que las reglas de Firestore están desplegadas: `npm run deploy:rules`.
