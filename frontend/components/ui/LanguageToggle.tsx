'use client';

import { useTranslation, type Language } from '@/contexts/LanguageContext';
import { Globe } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export default function LanguageToggle() {
  const { language, setLanguage, languages } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-white/60 backdrop-blur-sm rounded-full border border-white/40 hover:bg-white/80 transition-colors"
        aria-label="Change language"
      >
        <Globe className="w-3.5 h-3.5 text-surface-600" />
        <span className="text-xs font-semibold text-surface-700">
          {languages.find((l) => l.id === language)?.label || 'EN'}
        </span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-xl border border-surface-100 overflow-hidden z-50 min-w-[120px] animate-fade-in">
          {languages.map((lang) => (
            <button
              key={lang.id}
              onClick={() => {
                setLanguage(lang.id);
                setOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${
                language === lang.id
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-surface-700 hover:bg-surface-50'
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
