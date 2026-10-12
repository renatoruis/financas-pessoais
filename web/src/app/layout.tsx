import '@fortawesome/fontawesome-free/css/all.min.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import type { ReactNode } from 'react';
import { ToastProvider } from '@/ui/toast';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Finanças',
  description: 'Acompanhamento financeiro pessoal e das empresas',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt" className={inter.variable}>
      <body className="font-sans">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
