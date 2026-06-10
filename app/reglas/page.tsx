import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { MICROCOPY } from "@/lib/microcopy";

export default function ReglasPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-10">
        <div className="wc-card p-5 sm:p-8">
          <h1 className="text-3xl font-bold">Reglas del torneo</h1>
          <p className="mt-2 text-wc-muted">{MICROCOPY.rules}</p>
          <p className="mt-3 text-wc-secondary">
            «Sin reglamento no hay remontada.»
          </p>

          <h2 className="mt-7 text-xl font-semibold text-wc-primary">
            Fase de grupos
          </h2>
          <ul className="list-disc list-inside text-wc-muted">
            <li>
              Acertar vencedor del partido:{" "}
              <b className="text-wc-text">5 puntos</b>
            </li>
            <li>
              Acertar vencedor + resultado exacto:{" "}
              <b className="text-wc-text">15 puntos</b>
            </li>
            <li>
              Acertar empate: <b className="text-wc-text">10 puntos</b>
            </li>
            <li>
              Acertar empate + resultado exacto:{" "}
              <b className="text-wc-text">20 puntos</b>
            </li>
          </ul>
          <h2 className="mt-6 text-xl font-semibold text-wc-primary">
            Octavos a final
          </h2>
          <ul className="list-disc list-inside text-wc-muted">
            <li>Octavos: 10 / 20 / +20 bonus</li>
            <li>Cuartos: 40 + bonus 40</li>
            <li>Semifinales: 60 + bonus 60</li>
            <li>3º y 4º: 80 + bonus 80</li>
            <li>Final: 100 + bonus 100</li>
          </ul>
          <h2 className="mt-6 text-xl font-semibold text-wc-gold">
            Campeón y pichichi
          </h2>
          <ul className="list-disc list-inside text-wc-muted">
            <li>
              Acertar el campeón del Mundial suma{" "}
              <b className="text-wc-gold">300 puntos</b>.
            </li>
            <li>
              Pichichi del Mundial acertado:{" "}
              <b className="text-wc-gold">300 puntos</b>.
            </li>
          </ul>
          <div className="mt-8 rounded-xl border border-wc-gold/60 bg-wc-gold/10 p-4 text-sm text-wc-text">
            <b>Clave de competición:</b> cuentan los 90 minutos y la prórroga.{" "}
            <b>No cuentan los penaltis.</b>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
