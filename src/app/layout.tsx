import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tu Futuro Yo - Envejecimiento con IA',
  description: 'Descubre cómo te verás en el futuro con inteligencia artificial',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="antialiased">
        <div className="vertical-screen bg-[var(--background-color)]">
          {children}
        </div>
      </body>
    </html>
  );
}