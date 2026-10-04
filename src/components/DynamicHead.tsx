import React, { useEffect } from 'react';
import { useRouter } from '../router/RouterContext';
import { useLanguage } from '../context/LanguageContext';
import { siteConfig } from '../config/site';
import { TLD_REGISTRY_DATABASE } from '../utils/tldData';
import { STRATEGY_HUBS_DATABASE } from '../utils/strategyData';

export const DynamicHead: React.FC = () => {
  const { route, params, currentPath, getLocalizedPath } = useRouter();
  const { t, language } = useLanguage();

  useEffect(() => {
    let pageTitle = `${siteConfig.name} - ${t('app_subtitle')}`;
    let pageDescription = t('landing_hero_subtitle');

    switch (route) {
      case 'home':
        pageTitle = `${siteConfig.name} - ${t('landing_hero_title')}`;
        pageDescription = t('landing_hero_subtitle');
        break;

      case 'audit':
        pageTitle = `${t('tab_audit')} - Mode A & B | ${siteConfig.name}`;
        pageDescription = `${t('mode_a_title')} & ${t('mode_b_title')} - ${t('fin_subtitle')}`;
        break;

      case 'brand':
        pageTitle = `${t('brand_title')} | ${siteConfig.name}`;
        pageDescription = `${t('brand_subtitle')} - ${t('step1_title')}`;
        break;

      case 'bulk':
        pageTitle = `${t('bulk_title')} | ${siteConfig.name}`;
        pageDescription = t('bulk_subtitle');
        break;

      case 'watchlist':
        pageTitle = `${t('watch_title')} | ${siteConfig.name}`;
        pageDescription = t('watch_subtitle');
        break;

      case 'outcomes':
        pageTitle = `${t('outcomes_title')} | ${siteConfig.name}`;
        pageDescription = t('outcomes_subtitle');
        break;

      case 'privacy':
        pageTitle = `${t('legal_privacy_title')} | ${siteConfig.name}`;
        pageDescription = t('privacy_intro_box');
        break;

      case 'terms':
        pageTitle = `${t('legal_terms_title')} | ${siteConfig.name}`;
        pageDescription = t('terms_intro_box');
        break;

      case 'tld': {
        const rawTld = (params.tld || 'com').toLowerCase().replace(/^\./, '');
        const meta = TLD_REGISTRY_DATABASE[rawTld];
        const tldName = meta ? meta.tld : `.${rawTld}`;
        pageTitle = `${tldName.toUpperCase()} Domain Extension Diligence & Valuation Guide | ${siteConfig.name}`;
        pageDescription = meta ? meta.description : `Official registry specifications, renewal costs, and real public sales for ${tldName}.`;
        break;
      }

      case 'strategy': {
        const rawStrategy = (params.strategy || 'brandable').toLowerCase().replace(/-/g, '_');
        const strat = STRATEGY_HUBS_DATABASE[rawStrategy] || STRATEGY_HUBS_DATABASE['brandable'];
        pageTitle = `${strat.name} Investment Strategy & Valuation Matrix | ${siteConfig.name}`;
        pageDescription = strat.subtitle;
        break;
      }

      default:
        pageTitle = `${siteConfig.name} - ${t('app_subtitle')}`;
        pageDescription = t('landing_hero_subtitle');
    }

    // 1. Update Document Title
    document.title = pageTitle;

    // 2. Update Meta Description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', pageDescription);

    // 3. Update OpenGraph Tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', pageTitle);

    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', pageDescription);

    const currentCanonicalUrl = `${siteConfig.url}${getLocalizedPath(currentPath, language)}`;
    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) ogUrl.setAttribute('content', currentCanonicalUrl);

    // 4. Update Canonical Link
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', currentCanonicalUrl);
  }, [route, params, currentPath, language, t]);

  return null;
};