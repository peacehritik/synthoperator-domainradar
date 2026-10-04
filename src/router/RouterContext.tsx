import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { SupportedLanguage } from '../types';

export type AppRoute =
  | 'home'
  | 'audit'
  | 'brand'
  | 'bulk'
  | 'watchlist'
  | 'outcomes'
  | 'privacy'
  | 'terms'
  | 'tld'
  | 'strategy';

export interface RouteState {
  currentPath: string;
  lang: SupportedLanguage;
  route: AppRoute;
  params: Record<string, string>;
  searchParams: URLSearchParams;
}

interface RouterContextType extends RouteState {
  navigate: (to: string, options?: { replace?: boolean }) => void;
  getLocalizedPath: (path: string, targetLang?: SupportedLanguage) => string;
}

const RouterContext = createContext<RouterContextType | undefined>(undefined);

const SUPPORTED_LANGS: SupportedLanguage[] = ['en', 'fr', 'ar', 'es', 'pt'];

/**
 * Parses path into language, route name, and dynamic params
 */
export function parseRoute(pathname: string, search: string): RouteState {
  const cleanPath = pathname.replace(/\/+$/, '') || '/';
  const segments = cleanPath.split('/').filter(Boolean);

  let lang: SupportedLanguage = 'en';
  let routeSegments = [...segments];

  // Check if first segment is a language prefix (e.g. /fr/audit -> lang: 'fr', routeSegments: ['audit'])
  if (segments.length > 0 && SUPPORTED_LANGS.includes(segments[0] as SupportedLanguage)) {
    lang = segments[0] as SupportedLanguage;
    routeSegments = segments.slice(1);
  }

  let route: AppRoute = 'home';
  const params: Record<string, string> = {};

  if (routeSegments.length === 0) {
    route = 'home';
  } else {
    const primary = routeSegments[0];
    switch (primary) {
      case 'audit':
        route = 'audit';
        break;
      case 'brand-selection':
      case 'brand':
        route = 'brand';
        break;
      case 'bulk':
      case 'bulk-audit':
        route = 'bulk';
        break;
      case 'watchlist':
      case 'portfolio':
        route = 'watchlist';
        break;
      case 'outcomes':
      case 'calibration':
        route = 'outcomes';
        break;
      case 'privacy':
      case 'privacy-policy':
        route = 'privacy';
        break;
      case 'terms':
      case 'terms-of-service':
        route = 'terms';
        break;
      case 'tld':
        route = 'tld';
        if (routeSegments[1]) {
          params.tld = routeSegments[1].toLowerCase().replace(/^\./, '');
        }
        break;
      case 'strategy':
        route = 'strategy';
        if (routeSegments[1]) {
          params.strategy = routeSegments[1].toLowerCase();
        }
        break;
      default:
        route = 'home';
    }
  }

  return {
    currentPath: pathname,
    lang,
    route,
    params,
    searchParams: new URLSearchParams(search),
  };
}

export const RouterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [routeState, setRouteState] = useState<RouteState>(() =>
    parseRoute(window.location.pathname, window.location.search)
  );

  const handleLocationChange = useCallback(() => {
    setRouteState(parseRoute(window.location.pathname, window.location.search));
  }, []);

  useEffect(() => {
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, [handleLocationChange]);

  const navigate = useCallback(
    (to: string, options?: { replace?: boolean }) => {
      if (options?.replace) {
        window.history.replaceState(null, '', to);
      } else {
        window.history.pushState(null, '', to);
      }
      handleLocationChange();
    },
    [handleLocationChange]
  );

  const getLocalizedPath = useCallback(
    (targetPath: string, targetLang?: SupportedLanguage): string => {
      const activeLang = targetLang || routeState.lang;
      const cleanTarget = targetPath.startsWith('/') ? targetPath : `/${targetPath}`;

      // Remove existing language prefix if present
      const segments = cleanTarget.split('/').filter(Boolean);
      let corePath = cleanTarget;
      if (segments.length > 0 && SUPPORTED_LANGS.includes(segments[0] as SupportedLanguage)) {
        corePath = '/' + segments.slice(1).join('/');
      }

      if (corePath === '/') {
        return activeLang === 'en' ? '/' : `/${activeLang}`;
      }

      return activeLang === 'en' ? corePath : `/${activeLang}${corePath}`;
    },
    [routeState.lang]
  );

  return (
    <RouterContext.Provider value={{ ...routeState, navigate, getLocalizedPath }}>
      {children}
    </RouterContext.Provider>
  );
};

export function useRouter(): RouterContextType {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error('useRouter must be used within a RouterProvider');
  }
  return context;
}

/**
 * SEO-Friendly Accessible Link Component
 * Emits real <a href="..."> tags for Google/Bing crawlers while enabling SPA navigation.
 */
export const Link: React.FC<{
  to: string;
  children: React.ReactNode;
  className?: string;
  title?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}> = ({ to, children, className = '', title, onClick }) => {
  const { navigate, getLocalizedPath } = useRouter();
  const localizedHref = getLocalizedPath(to);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented) return;
    if (e.button === 0 && !e.metaKey && !e.ctrlKey && !e.altKey && !e.shiftKey) {
      e.preventDefault();
      navigate(localizedHref);
    }
  };

  return (
    <a href={localizedHref} onClick={handleClick} className={className} title={title}>
      {children}
    </a>
  );
};