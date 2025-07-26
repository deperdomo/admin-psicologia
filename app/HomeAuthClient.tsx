"use client"
import { useRequireAuth } from '@/lib/hooks/useRequireAuth'

export default function HomeAuthClient({ children }: { children: React.ReactNode }) {
  const { user, loading } = useRequireAuth();
  if (loading) return <div>Cargando...</div>;
  if (!user) return null;
  return <>{children}</>;
}
