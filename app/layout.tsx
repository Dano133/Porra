import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Porra del Mundial',
  description: 'Compite con tus amigos prediciendo los resultados del Mundial.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
}
