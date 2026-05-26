'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Sprout } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireProfile?: boolean;
}

/**
 * Wraps seller pages — redirects to login if not authenticated,
 * and optionally to profile setup if profile is incomplete.
 */
export default function ProtectedRoute({
  children,
  requireProfile = false,
}: ProtectedRouteProps) {
  const router = useRouter();
  const { user, loading, profileComplete } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace('/seller/login');
      } else if (requireProfile && !profileComplete) {
        router.replace('/seller/profile');
      }
    }
  }, [user, loading, profileComplete, requireProfile, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-surface-50">
        <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center shadow-xl shadow-primary-500/30 mb-6 animate-pulse">
          <Sprout className="w-9 h-9 text-white" />
        </div>
        <div className="flex items-center gap-2 text-surface-500">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm font-medium">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) return null;
  if (requireProfile && !profileComplete) return null;

  return <>{children}</>;
}
