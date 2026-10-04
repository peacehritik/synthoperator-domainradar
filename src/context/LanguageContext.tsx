import React, { createContext, useContext, useState, useEffect } from 'react';
import type { SupportedLanguage } from '../types';
import { TRANSLATIONS, formatCurrency, formatNumber } from '../i18n/translations';
import { useRouter } from '../router/RouterContext';
import { siteConfig } from '../config/site';

interface LanguageContextType {
  language: SupportedLanguage;
  direction: 'ltr' | 'rtl';
  isRtl: boolean;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: string, fallbackOrParams?: string | Record<string, string | number>, params?: Record<string, string | number>) => string;
  formatPrice: (amount: number) => string;
  formatCount: (val: number) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = `${siteConfig.name.toLowerCase()}_user_lang`;

function detectInitialLanguage(): SupportedLanguage {
  try {
    // 1. URL Path takes highest precedence for SEO
    const pathSegments = window.location.pathname.split('/').filter(Boolean);
    if (pathSegments.length > 0 && ['en', 'fr', 'ar', 'es', 'pt'].includes(pathSegments[0])) {
      return pathSegments[0] as SupportedLanguage;
    }

    // 2. Saved preference
    const saved = localStorage.getItem(STORAGE_KEY) as SupportedLanguage | null;
    if (saved && ['en', 'fr', 'es', 'pt', 'ar'].includes(saved)) {
      return saved;
    }

    // 3. Browser language
    const browserLang = (navigator.language || '').toLowerCase();
    if (browserLang.startsWith('ar')) return 'ar';
    if (browserLang.startsWith('fr')) return 'fr';
    if (browserLang.startsWith('es')) return 'es';
    if (browserLang.startsWith('pt')) return 'pt';
    return 'en';
  } catch {
    return 'en';
  }
}

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { lang: urlLang, getLocalizedPath, navigate, currentPath } = useRouter();
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    return urlLang && ['en', 'fr', 'ar', 'es', 'pt'].includes(urlLang)
      ? urlLang
      : detectInitialLanguage();
  });

  // Sync state if URL changes (e.g. user visits /fr/audit or /ar/terms)
  useEffect(() => {
    if (urlLang && urlLang !== language && ['en', 'fr', 'ar', 'es', 'pt'].includes(urlLang)) {
      setLanguageState(urlLang);
    }
  }, [urlLang, language]);

  const isRtl = language === 'ar';
  const direction: 'ltr' | 'rtl' = isRtl ? 'rtl' : 'ltr';

  const setLanguage = (newLang: SupportedLanguage) => {
    setLanguageState(newLang);
    try {
      localStorage.setItem(STORAGE_KEY, newLang);
      // Seamlessly transition URL path to include language prefix without reload
      const newPath = getLocalizedPath(currentPath, newLang);
      navigate(newPath);
    } catch (err) {
      console.warn('Failed to save language preference:', err);
    }
  };

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = direction;
    if (isRtl) {
      document.body.classList.add('font-arabic');
    } else {
      document.body.classList.remove('font-arabic');
    }
  }, [language, direction, isRtl]);

  const t = (
    key: string,
    fallbackOrParams?: string | Record<string, string | number>,
    params?: Record<string, string | number>
  ): string => {
    const dict = TRANSLATIONS[language] || TRANSLATIONS.en;
    const hasFallback = typeof fallbackOrParams === 'string';
    const fallback = hasFallback ? fallbackOrParams : undefined;
    const activeParams = hasFallback ? params : (fallbackOrParams as Record<string, string | number> | undefined);

    let text = dict[key] || TRANSLATIONS.en[key] || fallback || key;

    // Global default variables automatically injected into all translation keys
    const mergedParams: Record<string, string | number> = {
      appName: siteConfig.name,
      appDomain: siteConfig.domain,
      appUrl: siteConfig.url,
      ...(activeParams || {}),
    };

    Object.entries(mergedParams).forEach(([paramKey, paramVal]) => {
      text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramVal));
    });

    return text;
  };

  const formatPrice = (amount: number): string => formatCurrency(amount, language);
  const formatCount = (val: number): string => formatNumber(val, language);

  return (
    <LanguageContext.Provider value={{ language, direction, isRtl, setLanguage, t, formatPrice, formatCount }}>
      {children}
    </LanguageContext.Provider>
  );
};

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

/**
 * Component to isolate technical values (domains, hashes, $, IPs)
 * so they remain strictly Left-to-Right even in Arabic RTL mode.
 */
export const LtrIsolate: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  return (
    <span dir="ltr" className={`inline-block font-mono ${className}`}>
      {children}
    </span>
  );
};