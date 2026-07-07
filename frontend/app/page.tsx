'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  Sprout,
  ShoppingBag,
  Store,
  Leaf,
  MapPin,
  ArrowRight,
  Sparkles,
  Loader2,
} from 'lucide-react';
import LanguageToggle from '@/components/ui/LanguageToggle';
import { useTranslation } from '@/contexts/LanguageContext';
import { useLocation } from '@/hooks/useLocation';
import { useAuth } from '@/contexts/AuthContext';

export default function LandingPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const { t } = useTranslation();
  const { requestLocation } = useLocation();
  const { user, seller } = useAuth();

  useEffect(() => {
    setMounted(true);
    // Trigger location request during intro animation
    requestLocation();

    // Hide splash screen after exactly 2.5 seconds
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, [requestLocation]);

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-slate-50">
      {/* 2.5s Premium Light/Glass Intro Splash Overlay */}
      <div
        className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b from-white via-emerald-50/90 to-teal-100/80 transition-all duration-700 ease-out pointer-events-none ${
          showSplash
            ? 'opacity-100 scale-100'
            : 'opacity-0 scale-105 pointer-events-none'
        }`}
      >
        {/* Background ambient glow orbs */}
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-emerald-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-amber-300/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

        {/* Floating Glass Centerpiece Card */}
        <div className="relative z-10 flex flex-col items-center text-center px-8 py-10 bg-white/80 backdrop-blur-2xl rounded-3xl border border-white shadow-2xl shadow-emerald-950/10 max-w-sm w-full mx-6">
          {/* Pulsing ring around icon */}
          <div className="relative w-28 h-28 rounded-3xl bg-emerald-500/10 flex items-center justify-center mb-6 animate-pulse">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 via-green-600 to-teal-600 flex items-center justify-center shadow-xl shadow-emerald-500/30 animate-bounce" style={{ animationDuration: '2s' }}>
              <Sprout className="w-11 h-11 text-white" />
              <div className="absolute -top-2 -right-2 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-md border border-emerald-100 animate-spin" style={{ animationDuration: '8s' }}>
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              </div>
            </div>
          </div>

          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2 flex items-center gap-1.5">
            WeFarm <span className="text-emerald-600">🌱</span>
          </h1>
          <p className="text-xs font-bold text-emerald-700 uppercase tracking-widest bg-emerald-100/80 px-3.5 py-1.5 rounded-full mb-8 border border-emerald-200/60 shadow-sm">
            India&apos;s Direct Plant Nursery Marketplace
          </p>

          <div className="flex items-center gap-3 px-5 py-3 bg-white rounded-2xl border border-slate-200/80 shadow-sm text-slate-700 text-xs font-bold w-full justify-center">
            <Loader2 className="w-4 h-4 animate-spin text-emerald-600 shrink-0" />
            <span>Connecting nurseries & verifying GPS...</span>
          </div>
        </div>
      </div>

      {/* Background Hero Gradients */}
      <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-emerald-50 via-teal-50/40 to-transparent pointer-events-none" />
      <div className="absolute -top-24 -left-24 w-80 h-80 bg-emerald-400/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-40 -right-24 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className={`relative z-10 flex flex-col min-h-screen max-w-5xl mx-auto w-full px-6 transition-all duration-700 ${mounted && !showSplash ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        {/* Header */}
        <header className="pt-8 pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-primary-500/30">
                <Sprout className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-surface-900 tracking-tight">
                  {t('common.appName')}
                </h1>
                <p className="text-[10px] font-medium text-primary-600 -mt-0.5 tracking-wide uppercase">
                  {t('common.tagline')}
                </p>
              </div>
            </div>
            <LanguageToggle />
          </div>
        </header>

        {/* Hero Section */}
        <section className="flex-1 flex flex-col justify-center py-8">
          <div className="relative mb-8">
            <div className="absolute -top-4 right-8 text-3xl animate-bounce" style={{ animationDuration: '3s' }}>🌱</div>
            <div className="absolute top-8 right-2 text-2xl animate-bounce" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }}>🍅</div>
            <div className="absolute top-16 right-16 text-2xl animate-bounce" style={{ animationDuration: '3.5s', animationDelay: '1s' }}>🌶️</div>

            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-earth-500" />
              <span className="text-sm font-semibold text-earth-600 tracking-wide uppercase">
                {t('landing.subtitle')}
              </span>
            </div>

            <h2 className="text-4xl font-extrabold text-surface-900 leading-tight text-balance">
              {t('landing.title1')}
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-500">
                {t('landing.title2')}
              </span>
              <span className="block">{t('landing.title3')}</span>
            </h2>

            <p className="mt-4 text-base text-surface-500 leading-relaxed max-w-xs">
              {t('landing.description')}
            </p>
          </div>

          {/* Stats bar */}
          <div className="flex items-center gap-4 mb-10">
            <div className="flex items-center gap-2 px-3 py-2 bg-white/70 backdrop-blur-sm rounded-xl border border-white/50">
              <MapPin className="w-4 h-4 text-primary-600" />
              <span className="text-xs font-semibold text-surface-700">{t('landing.locationBased')}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-white/70 backdrop-blur-sm rounded-xl border border-white/50">
              <Leaf className="w-4 h-4 text-primary-600" />
              <span className="text-xs font-semibold text-surface-700">{t('landing.alwaysFresh')}</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col md:flex-row gap-4 w-full">
            <button
              id="btn-buy"
              onClick={() => router.push('/buyer')}
              className="w-full group relative overflow-hidden rounded-2xl transition-all duration-300 active:scale-[0.98]"
            >
              <div className="absolute inset-0 gradient-primary opacity-90 group-hover:opacity-100 transition-opacity" />
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              <div className="relative flex items-center justify-between px-6 py-5">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <ShoppingBag className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-bold text-white">
                      {t('landing.buyButton')}
                    </h3>
                    <p className="text-sm text-white/80">
                      {t('landing.buyDescription')}
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-6 h-6 text-white/80 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

            <button
              id="btn-sell"
              onClick={() => {
                if (user) {
                  if (seller?.profile_complete) {
                    router.push('/seller/dashboard');
                  } else {
                    router.push('/seller/profile');
                  }
                } else {
                  router.push('/seller/login');
                }
              }}
              className="w-full group relative overflow-hidden rounded-2xl bg-white border-2 border-surface-200 transition-all duration-300 hover:border-primary-300 hover:shadow-lg hover:shadow-primary-500/10 active:scale-[0.98]"
            >
              <div className="flex items-center justify-between px-6 py-5">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-primary-50 rounded-xl flex items-center justify-center group-hover:bg-primary-100 transition-colors">
                    <Store className="w-7 h-7 text-primary-600" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-bold text-surface-900">
                      {t('landing.sellButton')}
                    </h3>
                    <p className="text-sm text-surface-500">
                      {t('landing.sellDescription')}
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-6 h-6 text-surface-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
              </div>
            </button>
          </div>
        </section>

        {/* Footer */}
        <footer className="pb-8 pt-4">
          <div className="flex items-center justify-center gap-2 text-surface-400">
            <Leaf className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">
              {t('landing.footer')}
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}
