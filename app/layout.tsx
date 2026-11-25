import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'Jalurtumbuh Jobs - Portal Rekrutmen & Karier',
  description: 'Temukan jalur karier yang tepat dan kelola rekrutmen perusahaan dengan mudah.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body suppressHydrationWarning className="flex min-h-screen w-full flex-col bg-slate-50">
        <AuthProvider>
          <Navbar />
          <main className="w-full flex-1 pt-16">{children}</main>
          <footer className="w-full border-t border-sky-100 bg-white py-6 text-xs text-slate-500">
            <div className="flex w-full flex-col items-center justify-between gap-2 px-4 sm:flex-row sm:px-6 lg:px-10">
              <p className="font-semibold text-brand-dark">
                Jalurtumbuh Jobs · Cari Kerja · Temukan Talenta
              </p>
              <p>© 2026 jalurtumbuh.id &amp; jalurtumbuh.co.id. All rights reserved.</p>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}