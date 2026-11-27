'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { homeFor, useAuth } from '@/lib/auth';
import { Role } from '@/lib/types';

export default function RoleGuard({
  roles,
  children,
}: {
  roles: Role[];
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const allowed = !!user && roles.includes(user.role);

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace('/login');
    else if (!allowed) router.replace(homeFor(user.role));
  }, [user, loading, allowed, router]);

  if (loading || !allowed) {
    return (
      <div className="flex min-h-[50vh] w-full items-center justify-center">
        <div className="text-sm text-slate-500">Memeriksa hak akses...</div>
      </div>
    );
  }
  return <>{children}</>;
}
