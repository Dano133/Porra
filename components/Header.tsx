import Link from 'next/link';
import Image from 'next/image';

export default function Header() {
  return (
    <header className="border-b border-wc-border bg-wc-surface">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/images/world-cup-logo.png"
            alt="Logo Mundial 2026"
            width={52}
            height={52}
            className="h-12 w-auto object-contain"
            priority
          />
          <span className="text-xl font-bold text-wc-text">
            Porra del Mundial de la FIFA 26
          </span>
        </Link>

        <nav className="flex gap-6 text-sm">
          <Link href="/registro" className="text-wc-muted hover:text-wc-primary">
            Registro
          </Link>
          <Link href="/ranking" className="text-wc-muted hover:text-wc-primary">
            Ranking
          </Link>
          <Link href="/porra" className="text-wc-muted hover:text-wc-primary">
            Mi porra
          </Link>
          <Link href="/reglas" className="text-wc-muted hover:text-wc-primary">
            Reglas
          </Link>
        </nav>
      </div>
    </header>
  );
}