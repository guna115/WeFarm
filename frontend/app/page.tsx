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
} from 'lucide-react';
import LanguageToggle from '@/components/ui/LanguageToggle';
import { useTranslation } from '@/contexts/LanguageContext';

export default function LandingPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute inset-0 gradient-hero" />
      <div className="absolute top-20 -left-20 w-72 h-72 bg-primary-300/20 rounded-full blur-3xl animate-pulse-soft" />
      <div className="absolute bottom-40 -right-20 w-80 h-80 bg-earth-300/20 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-200/10 rounded-full blur-3xl" />

      {/* Content */}
      <div className={`relative z-10 flex flex-col min-h-screen max-w-5xl mx-auto w-full px-6 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>

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
          {/* Floating icons decoration */}
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
            {/* BUY Button */}
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

            {/* SELL Button */}
            <button
              id="btn-sell"
              onClick={() => router.push('/seller/login')}
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
