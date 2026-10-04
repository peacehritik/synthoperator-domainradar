/**
 * Global Site & Brand Configuration Module
 * Single source of truth for application branding, domains, and creator attribution.
 * Defaults to SynthOperator ecosystem (https://synthoperator.com).
 */

const envName = (import.meta as any).env?.APP_NAME;
const envUrl = (import.meta as any).env?.APP_URL;

export const siteConfig = {
  name: (envName && typeof envName === 'string' && envName.trim()) || 'SynthOperator DomainRadar',
  url: ((envUrl && typeof envUrl === 'string' && envUrl.trim()) || 'https://synthoperator.com').replace(/\/+$/, ''),
  creator: {
    name: 'Hafid Bas',
    handle: '@hafid_bas',
    twitter: 'https://x.com/hafid_bas',
    github: 'https://github.com/peacehritik',
  },
  get domain(): string {
    try {
      return new URL(this.url).hostname;
    } catch {
      return 'synthoperator.com';
    }
  },
  get supportEmail(): string {
    return 'support@synthoperator.com';
  },
  version: '2.4.0',
};