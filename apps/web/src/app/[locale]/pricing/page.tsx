'use client';

import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { usePlans, useMySubscription, useCreateSubscriptionPayment } from '@/lib/api/payments';
import { useAuth } from '@/providers/auth-provider';
import { useToast } from '@/components/toast';
import { useTranslations } from 'next-intl';

const PLAN_ICONS: Record<string, string> = {
  BASIC: 'token',
  PRO: 'workspace_premium',
  ENTERPRISE: 'diamond',
};

const PLAN_COLORS: Record<string, { card: string; badge: string; btn: string }> = {
  BASIC: { card: 'border-outline-variant/20', badge: 'bg-surface-container text-on-surface-variant', btn: 'bg-surface-container-high text-on-surface' },
  PRO: { card: 'border-primary/30 ring-2 ring-primary/10', badge: 'bg-primary/10 text-primary', btn: 'bg-primary text-on-primary' },
  ENTERPRISE: { card: 'border-amber-300/30 ring-2 ring-amber-200/10', badge: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400', btn: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white' },
};

export default function PricingPage() {
  const tp = useTranslations('pricing');
  const { user } = useAuth();
  const { data: plans, isLoading } = usePlans();
  const { data: mySub } = useMySubscription();
  const subscribe = useCreateSubscriptionPayment();
  const { addToast } = useToast();

  async function handleSubscribe(plan: 'PRO' | 'ENTERPRISE') {
    if (!user) { addToast('error', tp('loginFirst')); return; }
    try {
      const result = await subscribe.mutateAsync({ plan });
      window.location.href = result.checkoutUrl;
    } catch (err: any) {
      addToast('error', err?.message || tp('error'));
    }
  }

  return (
    <>
      <Navbar />
      <main className="pt-28 pb-16 max-w-5xl mx-auto px-6">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-black text-on-surface mb-3">{tp('title')}</h1>
          <p className="text-on-surface-variant text-sm max-w-xl mx-auto">{tp('subtitle')}</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <div key={i} className="h-80 animate-pulse bg-surface-container-low rounded-2xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans?.map(plan => {
              const colors = PLAN_COLORS[plan.plan] || PLAN_COLORS.BASIC;
              const isCurrent = mySub?.plan === plan.plan && mySub.status === 'ACTIVE';
              const isFreePlan = plan.plan === 'BASIC';

              return (
                <div key={plan.plan} className={`relative bg-surface-container-lowest dark:bg-surface-container rounded-2xl border ${colors.card} p-6 flex flex-col`}>
                  {plan.plan === 'PRO' && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-on-primary text-[10px] font-black px-4 py-1 rounded-full">
                      {tp('popular')}
                    </div>
                  )}

                  <div className="text-center mb-6">
                    <div className={`w-12 h-12 mx-auto rounded-xl ${colors.badge} flex items-center justify-center mb-3`}>
                      <span className="material-symbols-outlined text-2xl">{PLAN_ICONS[plan.plan]}</span>
                    </div>
                    <h3 className="text-lg font-black text-on-surface">{tp(`plan${plan.plan}`)}</h3>
                    <div className="mt-2">
                      <span className="text-3xl font-black text-on-surface">{plan.price === 0 ? tp('free') : `${plan.price}`}</span>
                      {plan.price > 0 && <span className="text-xs text-on-surface-variant font-bold ms-1">{tp('perMonth')}</span>}
                    </div>
                  </div>

                  <ul className="space-y-3 flex-1 mb-6">
                    <li className="flex items-center gap-2 text-sm">
                      <span className="material-symbols-outlined text-primary text-base">check_circle</span>
                      <span className="text-on-surface-variant">{plan.listings === -1 ? tp('unlimitedListings') : tp('listingsCount', { count: plan.listings })}</span>
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <span className="material-symbols-outlined text-primary text-base">check_circle</span>
                      <span className="text-on-surface-variant">{plan.featured === 0 ? tp('noFeatured') : tp('featuredCount', { count: plan.featured })}</span>
                    </li>
                    {plan.priority && (
                      <li className="flex items-center gap-2 text-sm">
                        <span className="material-symbols-outlined text-amber-500 text-base">check_circle</span>
                        <span className="text-on-surface-variant">{tp('prioritySearch')}</span>
                      </li>
                    )}
                  </ul>

                  {isCurrent ? (
                    <div className="w-full py-3 text-center text-sm font-black text-primary border border-primary/20 rounded-xl bg-primary/5">
                      {tp('currentPlan')}
                    </div>
                  ) : isFreePlan ? (
                    <div className="w-full py-3 text-center text-sm font-bold text-on-surface-variant">
                      {tp('defaultPlan')}
                    </div>
                  ) : (
                    <button
                      onClick={() => handleSubscribe(plan.plan as 'PRO' | 'ENTERPRISE')}
                      disabled={subscribe.isPending}
                      className={`w-full py-3 rounded-xl text-sm font-black hover:brightness-110 transition-all disabled:opacity-50 ${colors.btn}`}
                    >
                      {subscribe.isPending ? tp('processing') : tp('subscribe')}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
