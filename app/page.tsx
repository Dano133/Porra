import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-10">
      <section className="mx-auto max-w-5xl px-6 py-20 text-center">
        <h1 className="text-5xl font-extrabold tracking-tight text-wc-text md:text-6xl">
          La porra del Mundial
        </h1>

        <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-wc-muted md:text-xl">
          Predice los resultados del torneo, compite con tus amigos y sigue la clasificación en tiempo real.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/registro"
            className="inline-flex h-12 items-center justify-center rounded-xl bg-wc-primary px-8 font-semibold text-black transition hover:opacity-90"
          >
            Registrarme
          </Link>

          <Link
            href="/porra"
            className="inline-flex h-12 items-center justify-center rounded-xl bg-wc-secondary px-8 font-semibold text-white transition hover:opacity-90"
          >
            Completar mi porra
          </Link>

          <Link
            href="/ranking"
            className="inline-flex h-12 items-center justify-center rounded-xl border border-wc-border bg-wc-surface px-8 font-semibold text-wc-text transition hover:border-wc-primary hover:text-wc-primary"
          >
            Ver ranking
          </Link>
        </div>
      </section>

        <section className="grid md:grid-cols-2 gap-6 mt-10">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="font-bold text-xl mb-2">¿Cómo funciona?</h2>
            <ol className="list-decimal list-inside text-gray-700 space-y-1">
              <li>Te registras con tu nombre y email.</li>
              <li>Rellenas tu porra antes de la fecha límite.</li>
              <li>Cargamos los resultados oficiales y calculamos tus puntos.</li>
              <li>Recibes actualizaciones por email cada 15 días.</li>
            </ol>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="font-bold text-xl mb-2">Reglas rápidas</h2>
            <ul className="text-gray-700 space-y-1 text-sm">
              <li>· Acertar vencedor en grupos: 5 pts (15 si exacto).</li>
              <li>· Acertar empate: 10 pts (20 si exacto).</li>
              <li>· Octavos: 10/cruce, +20 si exacto.</li>
              <li>· Final: 100/cruce, +100 si exacto.</li>
              <li>· Acertar campeón: 300 pts.</li>
            </ul>
            <Link href="/reglas" className="inline-block mt-3 text-wc-primary text-sm font-medium">
              Ver reglas completas →
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
