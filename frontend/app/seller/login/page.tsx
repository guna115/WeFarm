'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sprout,
  Phone,
  ArrowLeft,
  ArrowRight,
  Shield,
  Loader2,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function SellerLoginPage() {
  const router = useRouter();
  const { user, loading: authLoading, devLogin, seller } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // If already logged in, redirect
  useEffect(() => {
    if (!authLoading && user) {
      if (seller?.profile_complete) {
        router.replace('/seller/dashboard');
      } else {
        router.replace('/seller/profile');
      }
    }
  }, [user, authLoading, seller, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneNumber.length < 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }
    setError('');
    setLoading(true);

    try {
      // Dev mode: just store phone and proceed
      devLogin(phoneNumber);

      // Small delay to let context update
      setTimeout(() => {
        router.push('/seller/profile');
      }, 300);
    } catch (err: any) {
      console.error('Login error:', err);
      setError('Login failed. Please try again.');
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 gradient-hero" />
      <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-white to-transparent" />

      <div className="relative z-10 flex flex-col min-h-screen px-6">
        {/* Header */}
        <header className="pt-6 pb-2">
          <button
            onClick={() => router.push('/')}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/60 backdrop-blur-sm hover:bg-white/80 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 text-surface-700" />
          </button>
        </header>

        {/* Content */}
        <div className="flex-1 flex flex-col justify-center pb-10">
          {/* Logo & Title */}
          <div className="mb-10">
            <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center shadow-xl shadow-primary-500/30 mb-6">
              <Sprout className="w-9 h-9 text-white" />
            </div>
            <h1 className="text-3xl font-extrabold text-surface-900 leading-tight">
              Seller Login
            </h1>
            <p className="mt-2 text-surface-500 text-base">
              Enter your phone number to get started
            </p>
          </div>

          {/* Phone Input */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="phone-input"
                className="block text-sm font-semibold text-surface-700 mb-2"
              >
                Phone Number
              </label>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-4 py-3.5 bg-surface-100 rounded-xl border-2 border-surface-200">
                  <span className="text-base">🇮🇳</span>
                  <span className="text-sm font-semibold text-surface-600">+91</span>
                </div>
                <div className="flex-1 relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
                  <input
                    id="phone-input"
                    type="tel"
                    maxLength={10}
                    value={phoneNumber}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, '');
                      setPhoneNumber(v);
                      setError('');
                    }}
                    placeholder="Enter phone number"
                    className="input-field pl-12"
                    autoFocus
                  />
                </div>
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-500 font-medium">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || phoneNumber.length < 10}
              className="w-full btn-primary flex items-center justify-center gap-2 py-4 text-base"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Continue
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

            <div className="flex items-center gap-2 justify-center text-surface-400 pt-2">
              <Shield className="w-4 h-4" />
              <span className="text-xs font-medium">
                Your number is safe and secure
              </span>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
