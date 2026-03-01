'use client';

/**
 * LFTG Platform — Contexte d'internationalisation (i18n)
 * Phase 12 — Support FR / EN / ES
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { fr } from './fr';
import { en } from './en';
import { es } from './es';
import type { Translations } from './fr';

export type Locale = 'fr' | 'en' | 'es';

const translations: Record<Locale, Translations> = { fr, en, es };

interface I18nContextType {
  locale: Locale;
  t: Translations;
  setLocale: (locale: Locale) => void;
}

const I18nContext = createContext<I18nContextType>({
  locale: 'fr',
  t: fr,
  setLocale: () => {},
});

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('fr');

  useEffect(() => {
    const saved = localStorage.getItem('lftg-locale') as Locale | null;
    if (saved && ['fr', 'en', 'es'].includes(saved)) {
      setLocaleState(saved);
    } else {
      // Détecter la langue du navigateur
      const browserLang = navigator.language.slice(0, 2) as Locale;
      if (['fr', 'en', 'es'].includes(browserLang)) {
        setLocaleState(browserLang);
      }
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('lftg-locale', newLocale);
    document.documentElement.lang = newLocale;
  };

  return (
    <I18nContext.Provider value={{ locale, t: translations[locale], setLocale }}>
      {children}
    </I18nContext.Provider>
  );
}

export const useI18n = () => useContext(I18nContext);

/**
 * Interpolation simple : t('errors.minLength', { min: 3 })
 * Remplace {{min}} par la valeur correspondante
 */
export function interpolate(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => String(values[key] ?? `{{${key}}}`));
}
