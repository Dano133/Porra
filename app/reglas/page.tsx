import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function ReglasPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-3xl font-bold mb-6">Reglas de puntuación</h1>

        <h2 className="text-xl font-semibold mt-6">Fase de grupos</h2>
        <ul className="list-disc list-inside text-gray-700">
          <li>Acertar vencedor del partido: <b>5 puntos</b></li>
          <li>Acertar vencedor + resultado exacto: <b>15 puntos</b></li>
          <li>Acertar empate: <b>10 puntos</b></li>
          <li>Acertar empate + resultado exacto: <b>20 puntos</b></li>
        </ul>

        <h2 className="text-xl font-semibold mt-6">Octavos de final</h2>
        <ul className="list-disc list-inside text-gray-700">
          <li>Por clasificado acertado: <b>10 pts</b></li>
          <li>Acertar clasificado y posición en el cruce: <b>20 pts</b></li>
          <li>+20 pts si además aciertas el resultado exacto del cruce</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6">Cuartos</h2>
        <p>Por clasificado: <b>40 pts</b>. +40 pts si cruce y resultado exacto.</p>

        <h2 className="text-xl font-semibold mt-6">Semifinales</h2>
        <p>Por clasificado: <b>60 pts</b>. +60 pts si cruce y resultado exacto.</p>

        <h2 className="text-xl font-semibold mt-6">3º y 4º puesto</h2>
        <p>Por clasificado: <b>80 pts</b>. +80 pts si cruce y resultado exacto.</p>

        <h2 className="text-xl font-semibold mt-6">Final</h2>
        <p>Por clasificado: <b>100 pts</b>. +100 pts si cruce y resultado exacto.</p>

        <h2 className="text-xl font-semibold mt-6">Campeón</h2>
        <p>Acertar el campeón del Mundial: <b>300 puntos</b>.</p>

        <div className="mt-8 bg-yellow-50 border border-yellow-200 p-4 rounded-md text-sm">
          <b>Importante:</b> los resultados se cuentan tras 90 minutos o, si la
          hubiera, tras la prórroga. <b>No cuentan los penaltis.</b>
        </div>
      </main>
      <Footer />
    </>
  );
}
