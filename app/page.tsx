import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { MICROCOPY } from '@/lib/microcopy';

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-10 md:py-16">
        <section className="wc-card p-8 text-center md:p-14">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-wc-primary">Mundial 2026</p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-wc-text md:text-6xl">Tu porra, tu legado.</h1>
          <p className="mx-auto mt-5 max-w-3xl text-lg text-wc-muted">{MICROCOPY.home}</p>
          <p className="mt-4 text-wc-gold">"La historia se escribe partido a partido."</p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link href="/registro" className="wc-btn-primary">Crear cuenta</Link>
            <Link href="/porra" className="wc-btn-secondary">Empezar mi porra</Link>
            <Link href="/ranking" className="wc-btn-gold">Ver clasificación</Link>
          </div>
        </section>

        <section className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="wc-card p-6">
            <h2 className="text-xl font-bold">Cómo se juega</h2>
            <p className="mt-1 text-wc-muted">Una dinámica clara, rápida y competitiva.</p>
            <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-wc-muted">
              <li>Te registras y entras en la competición.</li>
              <li>Rellenas tu porra antes del cierre.</li>
              <li>Se calculan puntos automáticamente.</li>
              <li>Subes posiciones en cada fecha.</li>
            </ol>
          </div>
          <div className="wc-card p-6">
            <h2 className="text-xl font-bold">Golpes de puntuación</h2>
            <ul className="mt-3 space-y-2 text-sm text-wc-muted">
              <li>• Resultado exacto en grupos: <span className="text-wc-primary">15 pts</span></li>
              <li>• Empate exacto: <span className="text-wc-primary">20 pts</span></li>
              <li>• Final acertada: <span className="text-wc-gold">100 + 100 pts</span></li>
              <li>• Campeón: <span className="text-wc-gold">300 pts</span></li>
            </ul>
            <Link href="/reglas" className="mt-4 inline-block text-sm font-semibold text-wc-primary hover:text-wc-accentSoft">Ver reglas completas →</Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
