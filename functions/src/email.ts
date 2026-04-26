/**
 * Wrapper minimal de Resend (https://resend.com).
 * Configurar con: `firebase functions:config:set resend.api_key="re_xxx" email.from="Nombre <a@b.com>"`
 * En tiempo de ejecución leer con functions.config(): mantenemos compat con env vars.
 */
import * as functions from 'firebase-functions';

function cfg(): { apiKey: string; from: string } {
  const c = (functions.config() as any) || {};
  return {
    apiKey: c.resend?.api_key || process.env.RESEND_API_KEY || '',
    from: c.email?.from || process.env.EMAIL_FROM || 'Porra <noreply@example.com>',
  };
}

export async function sendMail(to: string | string[], subject: string, html: string) {
  const { apiKey, from } = cfg();
  if (!apiKey) {
    console.warn('[email] Sin RESEND_API_KEY: simulando envío a', to);
    return { simulated: true };
  }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ from, to: Array.isArray(to) ? to : [to], subject, html }),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
  return res.json();
}

export function welcomeTemplate(name: string, siteUrl: string) {
  return `<div style="font-family:sans-serif">
    <h2>¡Bienvenido/a, ${escape(name)}!</h2>
    <p>Te has registrado en la Porra del Mundial. Completa tu porra antes del cierre:</p>
    <p><a href="${siteUrl}/porra">Ir a mi porra</a></p>
  </div>`;
}
export function confirmationTemplate(name: string, siteUrl: string) {
  return `<div style="font-family:sans-serif">
    <h2>¡Porra recibida, ${escape(name)}!</h2>
    <p>Hemos guardado tus predicciones. Suerte. 🍀</p>
    <p><a href="${siteUrl}/ranking">Ver ranking</a></p>
  </div>`;
}
export function biweeklyTemplate(name: string, position: number, points: number, siteUrl: string) {
  return `<div style="font-family:sans-serif">
    <h2>Hola ${escape(name)}</h2>
    <p>Esta es tu actualización quincenal:</p>
    <ul>
      <li>Posición actual: <b>#${position}</b></li>
      <li>Puntos: <b>${points}</b></li>
    </ul>
    <p><a href="${siteUrl}/ranking">Ver ranking completo</a></p>
  </div>`;
}
function escape(s: string) {
  return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
}
