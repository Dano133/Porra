import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Porra del Mundial',
  description: 'Compite con tus amigos prediciendo los resultados del Mundial.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-wc-background text-wc-text antialiased">
        {children}
      </body>
    </html>
  );
}
