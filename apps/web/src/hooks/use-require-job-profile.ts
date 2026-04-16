'use client';

import { useCallback } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useAuth } from '@/providers/auth-provider';
import { useAuthModal } from '@/providers/auth-modal-provider';
import { useMyDriverProfile, useMyEmployerProfile } from '@/lib/api';
import { useToast } from '@/components/toast';

export type JobProfileRole = 'driver' | 'employer' | 'any';

interface JobProfileState {
  isLoading: boolean;
  hasDriver: boolean;
  hasEmployer: boolean;
  hasAny: boolean;
  role: 'driver' | 'employer' | null;
}

/**
 * Hook that provides job-profile state and a guard function.
 *
 * The guard function checks:
 *  1. Authentication (opens login overlay if needed)
 *  2. Profile existence (redirects to onboarding if missing)
 *
 * Usage:
 *   const { profile, requireProfile } = useRequireJobProfile();
 *
 *   // Guard an action (e.g. apply button)
 *   requireProfile('driver', () => applyToJob());
 *
 *   // Guard a page — call in useEffect
 *   useEffect(() => { requireProfile('employer'); }, []);
 */
export function useRequireJobProfile() {
  const { isAuthenticated } = useAuth();
  const { open } = useAuthModal();
  const router = useRouter();
  const { addToast } = useToast();

  const { data: driverProfile, isLoading: driverLoading } = useMyDriverProfile(isAuthenticated);
  const { data: employerProfile, isLoading: employerLoading } = useMyEmployerProfile(isAuthenticated);

  const isLoading = driverLoading || employerLoading;
  const hasDriver = !!driverProfile;
  const hasEmployer = !!employerProfile;
  const hasAny = hasDriver || hasEmployer;
  const role: 'driver' | 'employer' | null = hasDriver ? 'driver' : hasEmployer ? 'employer' : null;

  const profile: JobProfileState = { isLoading, hasDriver, hasEmployer, hasAny, role };

  const requireProfile = useCallback(
    (requiredRole: JobProfileRole, action?: () => void | Promise<void>) => {
      // 1. Auth check
      if (!isAuthenticated) {
        open({
          message: 'سجّل الدخول للوصول إلى هذه الخدمة',
          onSuccess: () => router.push('/jobs/onboarding'),
        });
        return false;
      }

      // 2. Profile check
      if (isLoading) return false;

      const satisfied =
        requiredRole === 'any'      ? hasAny :
        requiredRole === 'driver'   ? hasDriver :
        requiredRole === 'employer' ? hasEmployer : false;

      if (!satisfied) {
        const msg =
          requiredRole === 'driver'   ? 'يجب إنشاء بروفايل سائق أولاً' :
          requiredRole === 'employer' ? 'يجب إنشاء بروفايل صاحب عمل أولاً' :
                                        'يجب إنشاء بروفايل أولاً';
        addToast('info', msg);
        router.push('/jobs/onboarding');
        return false;
      }

      // 3. All good — run action if provided
      if (action) action();
      return true;
    },
    [isAuthenticated, isLoading, hasDriver, hasEmployer, hasAny, open, router, addToast],
  );

  return { profile, requireProfile };
}
