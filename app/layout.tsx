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
      <body suppressHydrationWarning className="flex min-h-screen w-full flex-col bg-[#F8FAFC]">
        <AuthProvider>
          <Navbar />
          <main className="w-full flex-1 pt-16">{children}</main>
          <footer className="w-full border-t border-blue-100 bg-gradient-to-r from-white via-blue-50/40 to-white py-6 text-xs text-slate-500">
            <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 sm:flex-row sm:px-6 lg:px-10">
              <p className="font-semibold text-slate-800">
                Jalurtumbuh Jobs · Cari Kerja · Temukan Talenta
              </p>
              <p>© 2026 jalurtumbuh.id & jalurtumbuh.co.id. All rights reserved.</p>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}