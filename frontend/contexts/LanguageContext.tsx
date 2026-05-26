'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

// Import all language files
import en from '@/i18n/en.json';
import te from '@/i18n/te.json';
import hi from '@/i18n/hi.json';

type Language = 'en' | 'te' | 'hi';
type Translations = Record<string, any>;

const languageMap: Record<Language, Translations> = { en, te, hi };

const languageLabels: Record<Language, string> = {
  en: 'EN',
  te: 'తెలుగు',
  hi: 'हिन्दी',
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  languages: { id: Language; label: string }[];
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key: string) => key,
  languages: [],
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  // Load saved language preference
  useEffect(() => {
    const saved = localStorage.getItem('wefarm-lang') as Language | null;
    if (saved && languageMap[saved]) {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('wefarm-lang', lang);
  }, []);

  // Translation function — supports nested keys like "buyer.search_placeholder"
  const t = useCallback(
    (key: string): string => {
      const translations = languageMap[language] || en;
      const keys = key.split('.');
      let result: any = translations;

      for (const k of keys) {
        if (result && typeof result === 'object' && k in result) {
          result = result[k];
        } else {
          // Fallback to English
          let fallback: any = en;
          for (const fk of keys) {
            if (fallback && typeof fallback === 'object' && fk in fallback) {
              fallback = fallback[fk];
            } else {
              return key; // Key not found anywhere
            }
          }
          return typeof fallback === 'string' ? fallback : key;
        }
      }

      return typeof result === 'string' ? result : key;
    },
    [language]
  );

  const languages = Object.entries(languageLabels).map(([id, label]) => ({
    id: id as Language,
    label,
  }));

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, languages }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  return useContext(LanguageContext);
}

export type { Language };
