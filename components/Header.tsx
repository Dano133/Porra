import Link from 'next/link';
import Image from 'next/image';

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-wc-border bg-wc-surface/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 md:px-6">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/images/world-cup-logo.png" alt="Logo Mundial 2026" width={48} height={48} className="h-11 w-auto" priority />
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-wc-primary">Porra 2026</p>
            <span className="text-lg font-bold text-wc-text">Rumbo a la gloria</span>
          </div>
        </Link>

        <nav className="flex gap-2 text-sm md:gap-3">
          {[
            ['Registro', '/registro'],
            ['Ranking', '/ranking'],
            ['Mi porra', '/porra'],
            ['Reglas', '/reglas'],
          ].map(([label, href]) => (
            <Link key={href} href={href} className="rounded-lg border border-transparent px-3 py-2 text-wc-muted transition hover:border-wc-border hover:bg-wc-background hover:text-wc-primary">
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
