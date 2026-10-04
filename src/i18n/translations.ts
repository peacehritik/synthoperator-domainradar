import type { SupportedLanguage } from '../types';
import en from '../locales/en.json';
import fr from '../locales/fr.json';
import ar from '../locales/ar.json';
import es from '../locales/es.json';
import pt from '../locales/pt.json';

export const TRANSLATIONS: Record<SupportedLanguage, Record<string, string>> = {
  en: en as Record<string, string>,
  fr: fr as Record<string, string>,
  ar: ar as Record<string, string>,
  es: es as Record<string, string>,
  pt: pt as Record<string, string>,
};

/**
 * Format currency according to the selected language
 */
export function formatCurrency(amount: number, lang: SupportedLanguage): string {
  const locale = lang === 'ar' ? 'ar-SA' : lang === 'fr' ? 'fr-FR' : lang === 'es' ? 'es-ES' : lang === 'pt' ? 'pt-BR' : 'en-US';
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `$${amount.toLocaleString()}`;
  }
}

/**
 * Format number with localized thousand separators
 */
export function formatNumber(val: number, lang: SupportedLanguage): string {
  const locale = lang === 'ar' ? 'ar-SA' : lang === 'fr' ? 'fr-FR' : lang === 'es' ? 'es-ES' : lang === 'pt' ? 'pt-BR' : 'en-US';
  try {
    return new Intl.NumberFormat(locale).format(val);
  } catch {
    return val.toLocaleString();
  }
}