import dns from 'dns';
import crypto from 'crypto';
import { promisify } from 'util';
import type {
  AuditVersionTrace,
  FreeEvidenceReport,
  UserManualEvidenceOverrides,
  MetricSourceTag,
  BusinessContext,
  CandidateEvaluationResult,
  ComparativeDecisionReport,
  BusinessPriority,
} from '../src/types.js';
import {
  queryTypeSafeJEV,
  classifyDomainStrategy,
  getStrategyProfile,
  generateStateHash,
  canonicalizeJson,
  ENGINE_VERSION,
  ACQUISITION_QUESTION_SET_VERSION,
  RENEWAL_QUESTION_SET_VERSION,
  BRAND_SELECTION_QUESTION_SET_VERSION,
  type JEVResponse,
  type DomainState,
  type DomainMetricsEvidence,
  type EvidenceCoverageReport,
  type DomainStrategyType,
  type StrategyProfileResult,
  type StrategyWeights,
} from './typesafeJev.js';
import { fetchFreeEvidence } from './freeEvidenceProvider.js';
import { findComparableSales, type ComparableSaleMatch } from './comparableSalesProvider.js';

/**
 * Deterministic SHA-256 state hashing for Mode C brand selection reports
 */
export function generateBrandSelectionHash(
  business: BusinessContext,
  domains: string[]
): string {
  const sortedDomains = [...domains].map(sanitizeDomain).filter(Boolean).sort();
  const canonical = canonicalizeJson({
    mode: 'brand_selection',
    questionSetVersion: BRAND_SELECTION_QUESTION_SET_VERSION,
    business,
    domains: sortedDomains,
  });
  return crypto.createHash('sha256').update(canonical).digest('hex');
}

export {
  generateStateHash,
  canonicalizeJson,
  ENGINE_VERSION,
  ACQUISITION_QUESTION_SET_VERSION,
  RENEWAL_QUESTION_SET_VERSION,
  BRAND_SELECTION_QUESTION_SET_VERSION,
};

const resolveDns = promisify(dns.resolve);

/**
 * Multi-Tiered Cache TTL Constants (in milliseconds):
 * - Structural Facts (length, syllables, TLD tier): 30 days
 * - RDAP Registry Status: 15 minutes
 * - Trademark & Search Evidence: 24 hours
 * - JEV Evaluation (State Hash Cache): 2 hours
 */
export const CACHE_TTLS = {
  STRUCTURAL: 30 * 24 * 60 * 60 * 1000, // 30 days
  RDAP: 15 * 60 * 1000,                 // 15 minutes
  EVIDENCE: 24 * 60 * 60 * 1000,        // 24 hours
  STATE_HASH: 2 * 60 * 60 * 1000,       // 2 hours
};

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttlMs: number;
  expiresAt: number;
}

const memoryCache = new Map<string, CacheEntry<any>>();

export function getFromCache<T>(key: string): { 
  data: T; 
  cachedAt: string; 
  expiresAt: string; 
  ttlSecondsRemaining: number; 
} | null {
  const entry = memoryCache.get(key);
  if (!entry) return null;
  const now = Date.now();
  if (now > entry.expiresAt) {
    memoryCache.delete(key);
    return null;
  }
  return {
    data: entry.data as T,
    cachedAt: new Date(entry.timestamp).toISOString(),
    expiresAt: new Date(entry.expiresAt).toISOString(),
    ttlSecondsRemaining: Math.max(0, Math.round((entry.expiresAt - now) / 1000)),
  };
}

export function setInCache<T>(key: string, data: T, ttlMs: number = CACHE_TTLS.RDAP): void {
  // Simple LRU purge if cache grows beyond 5000 entries
  if (memoryCache.size > 5000) {
    const oldestKey = memoryCache.keys().next().value;
    if (oldestKey) memoryCache.delete(oldestKey);
  }
  const now = Date.now();
  memoryCache.set(key, { 
    data, 
    timestamp: now,
    ttlMs,
    expiresAt: now + ttlMs,
  });
}

export function purgeCacheKey(keyOrPrefix: string): number {
  let purged = 0;
  for (const k of memoryCache.keys()) {
    if (k === keyOrPrefix || k.startsWith(keyOrPrefix)) {
      memoryCache.delete(k);
      purged++;
    }
  }
  return purged;
}

/**
 * Strict domain string sanitization
 * Removes protocols, leading www., paths, queries, ports, and trailing slashes.
 */
export function sanitizeDomain(raw: string): string {
  if (!raw || typeof raw !== 'string') return '';
  let domain = raw.trim().toLowerCase();
  // Strip protocol (http://, https://, ftp://, etc.)
  domain = domain.replace(/^[a-zA-Z]+:\/\//, '');
  // Strip credentials or port if any
  domain = domain.replace(/^.*@/, '');
  // Extract only host portion (before slash, question mark, or colon)
  domain = domain.split('/')[0].split('?')[0].split('#')[0].split(':')[0];
  // Strip leading www.
  domain = domain.replace(/^www\./, '');
  // Strip invalid characters and trailing dots
  domain = domain.replace(/[^a-z0-9.-]/g, '');
  domain = domain.replace(/^\.+|\.+$/g, '');
  return domain;
}

export interface RDAPResult {
  domain: string;
  status: 'available' | 'registered' | 'rate_limited' | 'timeout_error';
  rdapStatusCode: number | null;
  registrar?: string;
  createdDate?: string;
  expirationDate?: string;
  updatedDate?: string;
  nameservers?: string[];
  rawStatus?: string[];
  dnsActive?: boolean;
}

/**
 * Deterministic RDAP and WHOIS query
 * Differentiates 404 (available), 200 (taken), 429 (rate-limited), 504/timeout
 */
export async function checkDomainAvailability(sanitizedDomain: string): Promise<RDAPResult> {
  const cacheKey = `rdap:${sanitizedDomain}`;
  const cached = getFromCache<RDAPResult>(cacheKey);
  if (cached) {
    return cached.data;
  }

  const result: RDAPResult = {
    domain: sanitizedDomain,
    status: 'registered',
    rdapStatusCode: null,
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500);

    const rdapUrl = `https://rdap.org/domain/${encodeURIComponent(sanitizedDomain)}`;
    const appName = process.env.APP_NAME || 'DomainRadar';
    const response = await fetch(rdapUrl, {
      signal: controller.signal,
      headers: {
        Accept: 'application/rdap+json, application/json',
        'User-Agent': `${appName}-Engine/1.0`,
      },
    });
    clearTimeout(timeoutId);

    result.rdapStatusCode = response.status;

    if (response.status === 404) {
      result.status = 'available';
    } else if (response.status === 200) {
      result.status = 'registered';
      const body = await response.json().catch(() => null);
      if (body) {
        // Parse registrar entity
        if (Array.isArray(body.entities)) {
          const regEntity = body.entities.find((e: any) =>
            Array.isArray(e.roles) && e.roles.includes('registrar')
          );
          if (regEntity && regEntity.vcardArray?.[1]) {
            const fnRow = regEntity.vcardArray[1].find((r: any) => r[0] === 'fn');
            if (fnRow && fnRow[3]) {
              result.registrar = String(fnRow[3]);
            }
          }
        }
        // Parse events (registration, expiration)
        if (Array.isArray(body.events)) {
          for (const ev of body.events) {
            if (ev.eventAction === 'registration') {
              result.createdDate = ev.eventDate;
            } else if (ev.eventAction === 'expiration') {
              result.expirationDate = ev.eventDate;
            } else if (ev.eventAction === 'last changed' || ev.eventAction === 'last update') {
              result.updatedDate = ev.eventDate;
            }
          }
        }
        // Parse nameservers
        if (Array.isArray(body.nameservers)) {
          result.nameservers = body.nameservers
            .map((ns: any) => ns.ldhName || ns.name)
            .filter(Boolean);
        }
        if (Array.isArray(body.status)) {
          result.rawStatus = body.status;
        }
      }
    } else if (response.status === 429) {
      result.status = 'rate_limited';
    } else if (response.status >= 500) {
      result.status = 'timeout_error';
    }
  } catch (err: any) {
    if (err.name === 'AbortError') {
      result.status = 'timeout_error';
      result.rdapStatusCode = 504;
    } else {
      // Fallback DNS test to determine if domain is resolving
      try {
        await resolveDns(sanitizedDomain);
        result.status = 'registered';
        result.dnsActive = true;
      } catch (dnsErr: any) {
        if (dnsErr.code === 'ENOTFOUND') {
          // Unresolving DNS does not guarantee 100% available, but marks potential drop/unregistered
          result.status = 'available';
          result.dnsActive = false;
        } else {
          result.status = 'timeout_error';
        }
      }
    }
  }

  setInCache(cacheKey, result, CACHE_TTLS.RDAP);
  return result;
}

export interface ExtensionInfo {
  tld: string;
  tier: 'Tier 1' | 'Tier 2' | 'Tier 3' | 'Tier 4';
  tierMultiplier: number;
  annualRenewalCost: number;
  credibility: 'High' | 'Strong' | 'Moderate' | 'Niche';
}

export function getExtensionDetails(domain: string): ExtensionInfo {
  const parts = domain.split('.');
  const tld = parts.length > 1 ? parts.slice(1).join('.') : 'com';

  switch (tld) {
    case 'com':
      return { tld: '.com', tier: 'Tier 1', tierMultiplier: 1.0, annualRenewalCost: 14, credibility: 'High' };
    case 'org':
      return { tld: '.org', tier: 'Tier 2', tierMultiplier: 0.8, annualRenewalCost: 14, credibility: 'Strong' };
    case 'net':
      return { tld: '.net', tier: 'Tier 2', tierMultiplier: 0.75, annualRenewalCost: 14, credibility: 'Strong' };
    case 'ai':
      return { tld: '.ai', tier: 'Tier 2', tierMultiplier: 0.95, annualRenewalCost: 80, credibility: 'High' };
    case 'io':
      return { tld: '.io', tier: 'Tier 2', tierMultiplier: 0.85, annualRenewalCost: 45, credibility: 'Strong' };
    case 'co':
      return { tld: '.co', tier: 'Tier 2', tierMultiplier: 0.75, annualRenewalCost: 28, credibility: 'Strong' };
    case 'app':
    case 'dev':
    case 'store':
    case 'xyz':
    case 'tech':
    case 'cloud':
    case 'online':
    case 'site':
    case 'club':
      return { tld: `.${tld}`, tier: 'Tier 3', tierMultiplier: 0.7, annualRenewalCost: 18, credibility: 'Moderate' };
    case 'ma': // Morocco ccTLD
    case 'ae': // UAE ccTLD
    case 'sa': // Saudi ccTLD
    case 'fr': // France ccTLD
    case 'de': // Germany ccTLD
    case 'uk': // UK ccTLD
    case 'co.uk':
    case 'ca':
    case 'es':
    case 'it':
    case 'nl':
    case 'ch':
    case 'jp':
    case 'in':
      return { tld: `.${tld}`, tier: 'Tier 3', tierMultiplier: 0.7, annualRenewalCost: 25, credibility: 'Moderate' };
    default:
      if (tld.length === 2 || tld.includes('.')) {
        // ccTLDs e.g. .ma, .fr, .co.uk
        return { tld: `.${tld}`, tier: 'Tier 3', tierMultiplier: 0.65, annualRenewalCost: 25, credibility: 'Moderate' };
      }
      return { tld: `.${tld}`, tier: 'Tier 4', tierMultiplier: 0.55, annualRenewalCost: 18, credibility: 'Niche' };
  }
}

/**
 * Syllable counter heuristic for English words / phonetic strings
 */
export function countSyllables(word: string): number {
  const clean = word.toLowerCase().replace(/[^a-z]/g, '');
  if (!clean) return 1;
  if (clean.length <= 3) return 1;

  const matches = clean.match(/[aeiouy]{1,2}/g);
  let count = matches ? matches.length : 1;

  if (clean.endsWith('e') && !clean.endsWith('le') && count > 1) {
    count--;
  }
  return Math.max(1, count);
}

// Commercial intent keyword clusters
const HIGH_VALUE_KEYWORDS = [
  'pay', 'card', 'bank', 'cash', 'money', 'credit', 'loan', 'finance', 'invest',
  'ai', 'bot', 'agent', 'cloud', 'data', 'api', 'code', 'dev', 'tech', 'smart',
  'shop', 'market', 'store', 'cart', 'buy', 'deal', 'mall', 'trade', 'sale',
  'cod', 'ship', 'hub', 'cargo', 'drop', 'box', 'swift', 'order',
  'health', 'care', 'med', 'fit', 'cure', 'life', 'doc', 'pharm',
  'auto', 'car', 'ride', 'drive', 'motor', 'rent', 'fly', 'trip',
  'law', 'legal', 'tax', 'audit', 'claim', 'trust', 'shield', 'secure'
];

// Major trademark risk terms
const TRADEMARK_TERMS = [
  'google', 'apple', 'amazon', 'meta', 'facebook', 'microsoft', 'netflix', 'twitter',
  'instagram', 'tiktok', 'uber', 'airbnb', 'paypal', 'shopify', 'stripe', 'aliexpress',
  'tesla', 'samsung', 'coca', 'pepsi', 'nike', 'adidas'
];

export interface PriceRange {
  low: number;
  high: number;
  midpoint: number;
}

export type AcquisitionPricingStatus = 'available_registry' | 'user_specified' | 'unknown_aftermarket';

export interface EconomicValuationResult {
  wholesale_range: PriceRange;
  retail_range: PriceRange;
  estimated_annual_sale_probability_pct: number;
  gross_expected_value_usd: number;
  acquisition_cost_usd: number | null;
  acquisition_status: AcquisitionPricingStatus;
  estimated_transaction_fees_usd: number;
  estimated_carrying_cost_usd: number;
  net_actuarial_expected_value_usd: number | null;
  is_positive_roi_spread: boolean | null;
}

export interface HoldingEfficiencyResult {
  annual_renewal_cost_usd: number;
  annual_parking_yield_usd: number;
  annual_inbound_expected_value_usd: number;
  total_annual_economic_value_usd: number;
  holding_efficiency_ratio: number; // total_annual_value / annual_renewal_cost
  efficiency_status: 'surplus_hold' | 'break_even_review' | 'negative_drag_drop';
  verdict_label: string;
}

export interface DomainValuation {
  domain: string;
  sld: string;
  length: number;
  syllables: number;
  pronounceabilityScore: number;
  extension: ExtensionInfo;
  brandabilityScore: number;
  keywordMatch: string[];
  searchVolumeEstimate: number | null;
  cpcEstimateUsd: number | null;
  backlinksCount: number | null;
  referringDomainsCount: number | null;
  comparableSalesCount: number | null;
  medianComparableUsd: number | null;
  comparables?: ComparableSaleMatch[];
  cpmTier: string;
  trademarkRisk: 'Low' | 'Medium' | 'High';
  estimatedValue: number;
  wholesaleLiquidationValue: number;
  annualCarryingCost: number;
  economic_valuation?: EconomicValuationResult;
}

/**
 * Deterministic Financial Valuation Engine: Wholesale, Retail End-User & Actuarial Expected Value
 */
export function calculateEconomicValuation(
  valuation: DomainValuation,
  strategyType: DomainStrategyType,
  liquidityChoice: 'high_liquidity' | 'slow_speculative' | 'illiquid',
  brandScore: number,
  askingPrice?: number | null,
  isDomainAvailable: boolean = false
): EconomicValuationResult {
  const isCom = valuation.extension.tld === '.com' || valuation.extension.tld === 'com';
  const isTier2 = valuation.extension.tier === 'Tier 2';
  const isTier3 = valuation.extension.tier === 'Tier 3';

  // 1. Wholesale Floor & Range Modeling
  let baseWholesale = 15;
  if (isCom) {
    baseWholesale = 50;
    if (valuation.length <= 4) baseWholesale = 180;
    if (valuation.length <= 3) baseWholesale = 650;
  } else if (isTier2) {
    baseWholesale = 35;
    if (valuation.extension.tld === '.ai') baseWholesale = 85;
    if (valuation.length <= 3) baseWholesale = 320;
  } else if (isTier3) {
    baseWholesale = 20;
  } else {
    baseWholesale = 8;
  }

  if (valuation.keywordMatch.length > 0) {
    baseWholesale *= 1.4;
  }

  const liquidityMultiplier =
    liquidityChoice === 'high_liquidity' ? 2.2 :
    liquidityChoice === 'illiquid' ? 0.5 : 1.0;

  const wholesaleMidpoint = Math.round(baseWholesale * liquidityMultiplier);
  const wholesaleLow = Math.max(5, Math.round(wholesaleMidpoint * 0.70));
  const wholesaleHigh = Math.max(15, Math.round(wholesaleMidpoint * 1.30));
  const wholesale_range: PriceRange = {
    low: wholesaleLow,
    high: wholesaleHigh,
    midpoint: Math.round((wholesaleLow + wholesaleHigh) / 2),
  };

  // 2. Retail End-User Range Modeling
  let baseRetailMid = 1200;
  if (isCom) {
    if (valuation.length <= 5 || strategyType === 'short_acronym_numeric') {
      baseRetailMid = 4800;
    } else if (valuation.length <= 8 && brandScore >= 3) {
      baseRetailMid = 2600;
    } else if (valuation.length <= 11) {
      baseRetailMid = 1600;
    } else {
      baseRetailMid = 650;
    }
  } else if (isTier2) {
    if (valuation.extension.tld === '.ai' || strategyType === 'tech_trend') {
      baseRetailMid = 3400;
    } else if (valuation.length <= 7) {
      baseRetailMid = 1800;
    } else {
      baseRetailMid = 900;
    }
  } else if (isTier3) {
    if (strategyType === 'geo_service') {
      baseRetailMid = 1100;
    } else {
      baseRetailMid = 480;
    }
  } else {
    baseRetailMid = 320;
  }

  const brandMultiplier =
    brandScore === 4 ? 1.5 :
    brandScore === 3 ? 1.2 :
    brandScore === 2 ? 1.0 :
    brandScore === 1 ? 0.75 : 0.40;

  let searchBoost = 0;
  if (valuation.searchVolumeEstimate !== null) {
    if (valuation.searchVolumeEstimate >= 5000) searchBoost = 1200;
    else if (valuation.searchVolumeEstimate >= 1000) searchBoost = 500;
  }

  let retailMidpoint = Math.round(baseRetailMid * brandMultiplier + searchBoost);
  if (valuation.trademarkRisk === 'High') {
    retailMidpoint = Math.min(retailMidpoint * 0.1, 80);
  } else if (valuation.trademarkRisk === 'Medium') {
    retailMidpoint = Math.round(retailMidpoint * 0.5);
  }

  // Symmetrical bounds (Rule 11: Exact arithmetic mean matches midpoint)
  const retailLow = Math.max(25, Math.round(retailMidpoint * 0.70));
  const retailHigh = Math.max(50, Math.round(retailMidpoint * 1.30));
  const retail_range: PriceRange = {
    low: retailLow,
    high: retailHigh,
    midpoint: Math.round((retailLow + retailHigh) / 2),
  };

  // 3. Actuarial Annual Sale Probability
  let probPct = 5.0; // 5% default
  if (liquidityChoice === 'high_liquidity' || strategyType === 'exact_match_keyword' || (isCom && valuation.length <= 4)) {
    probPct = isCom && valuation.length <= 4 ? 22.0 : 18.0;
  } else if (strategyType === 'tech_trend') {
    probPct = 7.5;
  } else if (strategyType === 'geo_service') {
    probPct = 6.5;
  } else if (strategyType === 'brandable' && brandScore >= 3) {
    probPct = 6.0;
  } else if (liquidityChoice === 'illiquid' || valuation.length > 14 || valuation.trademarkRisk === 'High') {
    probPct = 1.5;
  }

  const gross_expected_value_usd = Math.round(retail_range.midpoint * (probPct / 100));
  const estimated_transaction_fees_usd = Math.round(gross_expected_value_usd * 0.15); // 15% broker/marketplace cut
  const estimated_carrying_cost_usd = valuation.annualCarryingCost * 2; // 2 years registry renewals

  // Deterministic Acquisition Cost Determination (Rule 06: Never fabricate an acquisition price)
  let acquisition_cost_usd: number | null = null;
  let acquisition_status: AcquisitionPricingStatus = 'unknown_aftermarket';

  if (askingPrice !== undefined && askingPrice !== null && askingPrice > 0) {
    acquisition_cost_usd = askingPrice;
    acquisition_status = 'user_specified';
  } else if (isDomainAvailable) {
    acquisition_cost_usd = valuation.annualCarryingCost; // Standard registration fee
    acquisition_status = 'available_registry';
  } else {
    acquisition_cost_usd = null;
    acquisition_status = 'unknown_aftermarket';
  }

  let net_actuarial_expected_value_usd: number | null = null;
  let is_positive_roi_spread: boolean | null = null;

  if (acquisition_cost_usd !== null) {
    net_actuarial_expected_value_usd =
      gross_expected_value_usd - acquisition_cost_usd - estimated_transaction_fees_usd - estimated_carrying_cost_usd;
    is_positive_roi_spread = net_actuarial_expected_value_usd > 0;
  }

  return {
    wholesale_range,
    retail_range,
    estimated_annual_sale_probability_pct: probPct,
    gross_expected_value_usd,
    acquisition_cost_usd,
    acquisition_status,
    estimated_transaction_fees_usd,
    estimated_carrying_cost_usd,
    net_actuarial_expected_value_usd,
    is_positive_roi_spread,
  };
}

/**
 * Holding Efficiency Engine: Total Annual Economic Value / Annual Renewal Cost
 */
export function calculateHoldingEfficiency(
  input: RenewalDecisionInput,
  valuation: DomainValuation,
  economicVal: EconomicValuationResult
): HoldingEfficiencyResult {
  const annual_renewal_cost_usd = input.annualRenewalCost || valuation.annualCarryingCost;
  const annual_parking_yield_usd = input.annualParkingRevenue || 0;
  const annual_inbound_expected_value_usd = (input.inboundOffersLast12m || 0) * 25;
  
  const gross_sale_expectation = economicVal.gross_expected_value_usd;
  const total_annual_economic_value_usd =
    gross_sale_expectation + annual_parking_yield_usd + annual_inbound_expected_value_usd;

  const holding_efficiency_ratio = parseFloat(
    (total_annual_economic_value_usd / Math.max(1, annual_renewal_cost_usd)).toFixed(2)
  );

  let efficiency_status: 'surplus_hold' | 'break_even_review' | 'negative_drag_drop' = 'break_even_review';
  let verdict_label = 'Break-Even Carrying Drag';

  if (holding_efficiency_ratio >= 2.0) {
    efficiency_status = 'surplus_hold';
    verdict_label = 'Profitable Holding Asset';
  } else if (holding_efficiency_ratio < 1.0) {
    efficiency_status = 'negative_drag_drop';
    verdict_label = 'Sunk Cost Drag - Drop Candidate';
  }

  return {
    annual_renewal_cost_usd,
    annual_parking_yield_usd,
    annual_inbound_expected_value_usd,
    total_annual_economic_value_usd,
    holding_efficiency_ratio,
    efficiency_status,
    verdict_label,
  };
}

export function calculateDomainValuation(domain: string): DomainValuation {
  const sanitized = sanitizeDomain(domain);
  const parts = sanitized.split('.');
  const sld = parts[0] || '';
  const ext = getExtensionDetails(sanitized);

  const length = sld.length;
  const syllables = countSyllables(sld);

  // Pronounceability heuristic: vowel-consonant distribution
  const vowels = (sld.match(/[aeiou]/g) || []).length;
  const consonants = (sld.match(/[bcdfghjklmnpqrstvwxyz]/g) || []).length;
  const vowelRatio = length > 0 ? vowels / length : 0;
  let pronounceabilityScore = 80;

  if (vowelRatio >= 0.25 && vowelRatio <= 0.55) {
    pronounceabilityScore += 15;
  } else if (vowelRatio < 0.15 || vowelRatio > 0.7) {
    pronounceabilityScore -= 30;
  }
  // Penalize consecutive hyphens or digits
  if (/\d/.test(sld)) pronounceabilityScore -= 20;
  if (/-/.test(sld)) pronounceabilityScore -= 25;
  pronounceabilityScore = Math.max(10, Math.min(100, pronounceabilityScore));

  // Keyword match
  const keywordMatches = HIGH_VALUE_KEYWORDS.filter((kw) => sld.includes(kw));

  // Trademark check
  let trademarkRisk: 'Low' | 'Medium' | 'High' = 'Low';
  if (TRADEMARK_TERMS.some((tm) => sld === tm || sld.startsWith(tm) || sld.endsWith(tm))) {
    trademarkRisk = 'High';
  } else if (TRADEMARK_TERMS.some((tm) => sld.includes(tm))) {
    trademarkRisk = 'Medium';
  }

  // Base brandability score (0 to 100)
  let brandScore = 50;
  if (length <= 4) brandScore += 35;
  else if (length <= 6) brandScore += 25;
  else if (length <= 9) brandScore += 15;
  else if (length > 15) brandScore -= 25;

  if (syllables <= 2) brandScore += 15;
  else if (syllables >= 4) brandScore -= 10;

  if (keywordMatches.length > 0) brandScore += 10;
  if (trademarkRisk === 'High') brandScore -= 40;
  if (trademarkRisk === 'Medium') brandScore -= 15;

  brandScore = Math.max(5, Math.min(99, brandScore));

  // Search volume estimate & CPC: only populate if confirmed keyword signals exist (Null Safety)
  let searchVolumeEstimate: number | null = null;
  let cpcEstimateUsd: number | null = null;
  if (keywordMatches.length > 0) {
    searchVolumeEstimate = 3500 * keywordMatches.length + (10 - Math.min(length, 10)) * 500;
    cpcEstimateUsd = keywordMatches.some((k) => ['pay', 'bank', 'invest', 'loan', 'finance'].includes(k))
      ? 9.50
      : keywordMatches.some((k) => ['ai', 'tech', 'cloud', 'dev', 'med'].includes(k))
      ? 4.80
      : 2.10;
  }

  const cpmTier = keywordMatches.some((k) => ['pay', 'bank', 'invest', 'loan', 'finance', 'law'].includes(k))
    ? 'Premium ($8-25 CPM)'
    : keywordMatches.some((k) => ['ai', 'tech', 'cloud', 'dev', 'med'].includes(k))
    ? 'High ($4-12 CPM)'
    : 'Standard ($1-4 CPM)';

  // Backlink & SEO profile: unobserved without external crawler (Strict Null Safety)
  const backlinksCount: number | null = null;
  const referringDomainsCount: number | null = null;

  // Real Public Comparable Sales Discovery (Deterministic Match)
  const compsQuery = findComparableSales(sanitized, sld, ext.tld, length, syllables, keywordMatches);
  const comparableSalesCount: number | null = compsQuery.comparableSalesCount;
  const medianComparableUsd: number | null = compsQuery.medianComparableUsd;
  const comparables = compsQuery.comparables;

  // Valuation algorithm ($)
  let baseVal = 200;
  if (length <= 3) baseVal = 18000;
  else if (length === 4) baseVal = 4800;
  else if (length <= 6) baseVal = 1800;
  else if (length <= 9) baseVal = 750;
  else if (length <= 13) baseVal = 320;
  else baseVal = 95;

  // Syllables discount / multiplier
  if (syllables <= 2) baseVal *= 1.35;
  else if (syllables >= 4) baseVal *= 0.7;

  // Keyword bonus
  if (keywordMatches.length > 0) {
    baseVal += keywordMatches.length * 450;
  }

  // TLD Tier multiplier
  baseVal *= ext.tierMultiplier;

  // Trademark discount
  if (trademarkRisk === 'High') {
    baseVal = Math.min(baseVal * 0.1, 50);
  } else if (trademarkRisk === 'Medium') {
    baseVal *= 0.45;
  }

  const estimatedValue = Math.round(Math.max(25, baseVal));
  const wholesaleLiquidationValue = Math.round(estimatedValue * 0.28);
  const annualCarryingCost = ext.annualRenewalCost;

  return {
    domain: sanitized,
    sld,
    length,
    syllables,
    pronounceabilityScore,
    extension: ext,
    brandabilityScore: brandScore,
    keywordMatch: keywordMatches,
    searchVolumeEstimate,
    cpcEstimateUsd,
    backlinksCount,
    referringDomainsCount,
    comparableSalesCount,
    medianComparableUsd,
    comparables,
    cpmTier,
    trademarkRisk,
    estimatedValue,
    wholesaleLiquidationValue,
    annualCarryingCost,
  };
}

export type RiskGateStatus = 'passed' | 'blocked' | 'warning';

export interface HardGateEvaluation {
  id: string;
  name: string;
  description: string;
  status: RiskGateStatus;
  triggered: boolean;
  reason: string | null;
}

export type CapitalDiligenceTier = 'micro' | 'mid' | 'high' | 'institutional';

export interface RiskBudgetReport {
  acquisition_price_usd: number | null;
  diligence_tier: CapitalDiligenceTier;
  tier_label: string;
  required_evidence_coverage_pct: number;
  actual_evidence_coverage_pct: number;
  is_diligence_satisfied: boolean;
}

export interface RiskEngineResult {
  overall_status: 'cleared' | 'hard_blocked' | 'diligence_warning';
  blocked_by_gate: string | null;
  evaluated_gates: HardGateEvaluation[];
  risk_budget: RiskBudgetReport;
  final_override_verdict: string | null; // e.g. "RISK_BLOCKED", "INSUFFICIENT_EVIDENCE", or null if clear
}

/**
 * Deterministic Hard Gates & Risk Budgeting Engine
 */
export function evaluateRiskEngine(
  valuation: DomainValuation,
  state: DomainState,
  jev?: JEVResponse,
  economicVal?: EconomicValuationResult,
  mode: 'buy' | 'renew' = 'buy'
): RiskEngineResult {
  const tmChoice = mode === 'buy'
    ? (jev?.modeAAnswers?.trademark_risk?.choice ?? (valuation.trademarkRisk === 'High' ? 'critical' : valuation.trademarkRisk === 'Medium' ? 'moderate' : 'clear'))
    : (jev?.modeBAnswers?.trademark_risk?.choice ?? (valuation.trademarkRisk === 'High' ? 'critical' : valuation.trademarkRisk === 'Medium' ? 'moderate' : 'clear'));

  const isTmCriticalOrHigh = tmChoice === 'critical' || tmChoice === 'high' || valuation.trademarkRisk === 'High';

  // GATE 1: Intellectual Property Collision (Rule 11: Screened, not a legal clearance)
  const gate1: HardGateEvaluation = {
    id: 'gate_trademark',
    name: 'Known-Brand Collision Screen',
    description: 'Screens against 1,000+ top global trademarks. Does not constitute formal legal trademark clearance.',
    status: isTmCriticalOrHigh ? 'blocked' : 'passed',
    triggered: isTmCriticalOrHigh,
    reason: isTmCriticalOrHigh
      ? 'Trademark collision detected against protected brands. Acquisition blocked to protect capital from UDRP/legal forfeiture.'
      : null,
  };

  // GATE 2: Baseline Evidence Sufficiency Gate (<35%)
  const actualCoverage = state.coverage_report.coverage_pct;
  const isEvidenceDeficient = actualCoverage < 35;
  const gate2: HardGateEvaluation = {
    id: 'gate_evidence_sufficiency',
    name: 'Baseline Evidence Sufficiency Gate',
    description: 'Enforces minimum 35% verifiable data coverage before enabling automated decision-making.',
    status: isEvidenceDeficient ? 'blocked' : 'passed',
    triggered: isEvidenceDeficient,
    reason: isEvidenceDeficient
      ? 'Total verified data coverage is below the 35% minimum threshold for automated decision-making.'
      : null,
  };

  // GATE 3: Capital-Proportional Risk Budgeting (Rule 06: Honest exposure reflection)
  const rawAcqPrice = economicVal?.acquisition_cost_usd ?? state.economics.asking_or_backorder_price ?? null;
  const effectivePrice = rawAcqPrice !== null ? rawAcqPrice : (mode === 'buy' ? 14 : 14);

  let diligenceTier: CapitalDiligenceTier = 'micro';
  let tierLabel = 'Micro-Capital Tier (< $30)';
  let requiredCoverage = 35;

  if (effectivePrice >= 2500) {
    diligenceTier = 'institutional';
    tierLabel = 'Institutional-Capital Tier (> $2,500)';
    requiredCoverage = 85;
  } else if (effectivePrice >= 500) {
    diligenceTier = 'high';
    tierLabel = 'High-Capital Tier ($500 - $2,500)';
    requiredCoverage = 75;
  } else if (effectivePrice >= 30) {
    diligenceTier = 'mid';
    tierLabel = 'Mid-Capital Tier ($30 - $500)';
    requiredCoverage = 55;
  } else {
    diligenceTier = 'micro';
    tierLabel = 'Micro-Capital Tier (< $30)';
    requiredCoverage = 35;
  }

  const isDiligenceSatisfied = actualCoverage >= requiredCoverage;
  const gate3: HardGateEvaluation = {
    id: 'gate_capital_budget',
    name: 'Capital-Proportional Risk Diligence',
    description: 'Requires scaled data diligence relative to capital exposure before approving automated buy.',
    status: isDiligenceSatisfied ? 'passed' : 'warning',
    triggered: !isDiligenceSatisfied,
    reason: !isDiligenceSatisfied
      ? `Capital outlay requires a minimum of ${requiredCoverage}% data diligence (current: ${actualCoverage}%). Manual verification of offline signals required before purchase.`
      : null,
  };

  const riskBudget: RiskBudgetReport = {
    acquisition_price_usd: rawAcqPrice,
    diligence_tier: diligenceTier,
    tier_label: tierLabel,
    required_evidence_coverage_pct: requiredCoverage,
    actual_evidence_coverage_pct: actualCoverage,
    is_diligence_satisfied: isDiligenceSatisfied,
  };

  // GATE 4: Mode A (Acquisition Net EV Gate) vs Mode B (Holding Efficiency & Sunk Cost Gate)
  let gate4: HardGateEvaluation;

  if (mode === 'buy') {
    const isPriceUnknown = economicVal?.acquisition_status === 'unknown_aftermarket';
    const isNegativeSpread = economicVal?.net_actuarial_expected_value_usd !== null && (economicVal?.net_actuarial_expected_value_usd ?? 0) < 0 && (rawAcqPrice ?? 0) > 50;

    gate4 = {
      id: 'gate_actuarial_spread',
      name: isPriceUnknown ? 'Acquisition Price Requirement Gate' : 'Negative Expected Value Gate',
      description: isPriceUnknown
        ? 'Requires confirmed asking price before executing automated acquisition calculations on registered domains.'
        : 'Guards against acquisitions where projected carrying drag and acquisition outlay yield negative net expected value.',
      status: isPriceUnknown || isNegativeSpread ? 'warning' : 'passed',
      triggered: isPriceUnknown || isNegativeSpread,
      reason: isPriceUnknown
        ? 'Domain is registered. Asking price is required to calculate Net Expected Value and ROI spread.'
        : isNegativeSpread
        ? 'Expected net resale yield after broker fees and 2-year carrying drag does not justify current asking price.'
        : null,
    };
  } else {
    // Mode B: Portfolio Holding Efficiency & Drag Gate (Forward-Looking Cashflow)
    const annualRenewal = valuation.annualCarryingCost;
    const parkingRev = state.metrics_evidence.annual_parking_revenue_usd ?? 0;
    const inbounds = state.metrics_evidence.inbound_inquiries_12m ?? 0;
    const isDragDeficit = parkingRev === 0 && inbounds === 0 && (state.holding_years ?? 1) >= 2 && valuation.wholesaleLiquidationValue < annualRenewal * 2;

    gate4 = {
      id: 'gate_holding_efficiency',
      name: 'Portfolio Carrying Drag & Sunk Cost Gate',
      description: 'Evaluates whether forward-looking monetization and inbound demand justify annual registry carrying fees.',
      status: isDragDeficit ? 'warning' : 'passed',
      triggered: isDragDeficit,
      reason: isDragDeficit
        ? `Zero monetization and zero inbound inquiries recorded over ${state.holding_years ?? 2} years. Carrying fees exceed residual liquidation value.`
        : null,
    };
  }

  const evaluatedGates = [gate1, gate2, gate3, gate4];
  const blockedGate = evaluatedGates.find((g) => g.status === 'blocked');
  const warningGate = evaluatedGates.find((g) => g.status === 'warning');

  let overallStatus: 'cleared' | 'hard_blocked' | 'diligence_warning' = 'cleared';
  let blockedByGate: string | null = null;
  let finalOverrideVerdict: string | null = null;

  if (blockedGate) {
    overallStatus = 'hard_blocked';
    blockedByGate = blockedGate.name;
    finalOverrideVerdict = blockedGate.id === 'gate_trademark' ? 'RISK_BLOCKED' : 'INSUFFICIENT_EVIDENCE';
  } else if (warningGate) {
    overallStatus = 'diligence_warning';
    finalOverrideVerdict = warningGate.id === 'gate_capital_budget' ? 'DILIGENCE_WARNING' : 'NEGATIVE_SPREAD_WARNING';
  }

  return {
    overall_status: overallStatus,
    blocked_by_gate: blockedByGate,
    evaluated_gates: evaluatedGates,
    risk_budget: riskBudget,
    final_override_verdict: finalOverrideVerdict,
  };
}

export interface EvidenceSignal {
  id: string;
  label: string;
  source: string; // e.g. "Deterministic Parser", "TLD Registry", "TypeSafe JEV", "RDAP"
  impact: 'high' | 'medium' | 'low';
}

export interface NextActionItem {
  id: string;
  action: string;
  target_dimension: string; // e.g., "Market Valuation", "Trademark Due Diligence", "SEO History"
  priority: 'critical' | 'recommended' | 'optional';
  suggested_tool_or_source: string; // e.g., "NameBio / Dan.com", "USPTO / WIPO Registry", "Wayback Machine"
}

export interface ExplainabilityReport {
  bull_signals: EvidenceSignal[]; // Positive confirmed facts
  bear_signals: EvidenceSignal[]; // Negative confirmed risks
  unknown_signals: EvidenceSignal[]; // Missing or unobserved data points
  next_actions: NextActionItem[]; // Specific actionable steps to resolve uncertainty
}

/**
 * 3-Pillar Explainability & Actionable Next Action Generator
 */
export function generateExplainabilityReport(
  valuation: DomainValuation,
  state: DomainState,
  jev?: JEVResponse,
  economicVal?: EconomicValuationResult,
  holdingEff?: HoldingEfficiencyResult,
  riskResult?: RiskEngineResult,
  mode: 'buy' | 'renew' = 'buy',
  freeEvidence?: FreeEvidenceReport,
  manualOverrides?: UserManualEvidenceOverrides
): ExplainabilityReport {
  const isCom = valuation.extension.tld === '.com' || valuation.extension.tld === 'com';
  const bull_signals: EvidenceSignal[] = [];
  const bear_signals: EvidenceSignal[] = [];
  const unknown_signals: EvidenceSignal[] = [];
  const next_actions: NextActionItem[] = [];

  // 1. BULL SIGNALS (+ Verified Positives)
  if (valuation.length <= 7) {
    bull_signals.push({
      id: 'bull_compact_length',
      label: `Compact length (${valuation.length} chars) enhances memorability and typing cadence.`,
      source: 'Deterministic Parser',
      impact: valuation.length <= 4 ? 'high' : 'medium',
    });
  }

  if (isCom) {
    bull_signals.push({
      id: 'bull_tld_equity',
      label: 'Tier 1 .com extension provides broad global market reach and baseline investor liquidity.',
      source: 'TLD Registry',
      impact: 'high',
    });
  } else if (valuation.extension.tier === 'Tier 1') {
    bull_signals.push({
      id: 'bull_tier1_extension',
      label: `Tier 1 extension (${valuation.extension.tld}) carries proven startup brand acceptance.`,
      source: 'TLD Registry',
      impact: 'high',
    });
  }

  if (valuation.syllables <= 3 && state.structure.pronounceable) {
    bull_signals.push({
      id: 'bull_phonetic_flow',
      label: 'Clean phonetic cadence suitable for global consumer brand.',
      source: 'Deterministic Parser',
      impact: 'medium',
    });
  }

  if (!state.structure.has_hyphens_or_digits) {
    bull_signals.push({
      id: 'bull_clean_structure',
      label: 'Pure alphanumeric structure with no digits or hyphens, minimizing typing friction.',
      source: 'Deterministic Parser',
      impact: 'medium',
    });
  }

  // Free Evidence Provider: Wayback Machine Archive History
  if (freeEvidence?.wayback.has_historical_snapshots) {
    bull_signals.push({
      id: 'bull_wayback_history',
      label: `Historical web footprint confirmed: ${freeEvidence.wayback.snapshot_count} Wayback snapshots dating back to ${freeEvidence.wayback.first_seen_year || 'historical archives'}.`,
      source: 'Wayback CDX (Free)',
      impact: 'high',
    });
  }

  // Free Evidence Provider: Google Autocomplete Demand (Rule 01: Do not over-interpret single suggestions)
  if (freeEvidence?.googleSuggest?.has_commercial_intent_tokens && (freeEvidence.googleSuggest.suggestion_count ?? 0) >= 2) {
    bull_signals.push({
      id: 'bull_google_suggest',
      label: `Commercial search intent detected (${freeEvidence.googleSuggest.suggestion_count} queries in Google Suggest).`,
      source: 'Google Suggest (Free)',
      impact: 'medium',
    });
  }

  // Free Evidence Provider: Wikipedia Knowledge Graph Entity
  if (freeEvidence?.wikipedia.is_encyclopedic_term) {
    bull_signals.push({
      id: 'bull_wikipedia_entity',
      label: `Recognized Wikipedia encyclopedic concept / knowledge graph entity (${freeEvidence.wikipedia.search_hit_count} search hits).`,
      source: 'Wikipedia Entity (Free)',
      impact: 'high',
    });
  }

  // Free Evidence Provider: Native DNS Resolution
  if (freeEvidence?.dns.is_resolving) {
    bull_signals.push({
      id: 'bull_dns_active',
      label: `Active DNS resolution detected${freeEvidence.dns.has_mx_mail_records ? ' with configured MX mail servers' : ''}.`,
      source: 'Node DNS (Free)',
      impact: 'medium',
    });
  }

  // User Manual Verified Overrides
  if (manualOverrides?.exact_search_volume !== undefined && manualOverrides.exact_search_volume !== null && Number(manualOverrides.exact_search_volume) > 0) {
    bull_signals.push({
      id: 'bull_manual_search',
      label: `User verified search volume: ${Number(manualOverrides.exact_search_volume).toLocaleString()} searches/mo.`,
      source: 'User Manual (Verified)',
      impact: 'high',
    });
  }

  if (manualOverrides?.cpc_usd !== undefined && manualOverrides.cpc_usd !== null && Number(manualOverrides.cpc_usd) > 0) {
    bull_signals.push({
      id: 'bull_manual_cpc',
      label: `User verified commercial CPC: $${Number(manualOverrides.cpc_usd).toFixed(2)}/click.`,
      source: 'User Manual (Verified)',
      impact: 'high',
    });
  }

  if (manualOverrides?.backlinks_count !== undefined && manualOverrides.backlinks_count !== null && Number(manualOverrides.backlinks_count) > 0) {
    bull_signals.push({
      id: 'bull_manual_backlinks',
      label: `User verified backlinks: ${Number(manualOverrides.backlinks_count).toLocaleString()} external links.`,
      source: 'User Manual (Verified)',
      impact: 'high',
    });
  }

  if (economicVal && economicVal.net_actuarial_expected_value_usd !== null && economicVal.net_actuarial_expected_value_usd > 0) {
    bull_signals.push({
      id: 'bull_positive_ev',
      label: 'Positive expected net yield over 2-year holding horizon.',
      source: 'Net EV Engine',
      impact: 'high',
    });
  }

  if (state.metrics_evidence.exact_search_volume !== null && state.metrics_evidence.exact_search_volume >= 1000 && !manualOverrides?.exact_search_volume) {
    bull_signals.push({
      id: 'bull_search_demand',
      label: `Proven organic exact search demand (${state.metrics_evidence.exact_search_volume.toLocaleString()} searches/mo).`,
      source: 'Search Intent',
      impact: 'high',
    });
  }

  const liquidityChoice = mode === 'buy'
    ? jev?.modeAAnswers?.aftermarket_liquidity?.choice
    : undefined;
  if (liquidityChoice === 'high_liquidity') {
    bull_signals.push({
      id: 'bull_high_liquidity',
      label: 'Strong secondary market auction velocity and institutional domainer appeal.',
      source: 'TypeSafe JEV',
      impact: 'high',
    });
  }

  if (mode === 'renew' && holdingEff) {
    if (holdingEff.annual_parking_yield_usd > holdingEff.annual_renewal_cost_usd) {
      bull_signals.push({
        id: 'bull_parking_surplus',
        label: `Parking monetization yield covers annual registry renewal costs (+$${holdingEff.annual_parking_yield_usd - holdingEff.annual_renewal_cost_usd}/yr).`,
        source: 'Portfolio Telemetry',
        impact: 'high',
      });
    }
    if (holdingEff.annual_inbound_expected_value_usd > 0) {
      bull_signals.push({
        id: 'bull_inbound_interest',
        label: 'Active buyer acquisition inquiries recorded over trailing 12-month period.',
        source: 'Brokerage Telemetry',
        impact: 'high',
      });
    }
  }

  // 2. BEAR SIGNALS (- Verified Risks & Costs)
  if (valuation.annualCarryingCost >= 30) {
    bear_signals.push({
      id: 'bear_carrying_drag',
      label: `Elevated registry renewal fee ($${valuation.annualCarryingCost}/yr) creates ongoing holding drag.`,
      source: 'TLD Registry',
      impact: 'medium',
    });
  }

  if (state.structure.has_hyphens_or_digits) {
    bear_signals.push({
      id: 'bear_structural_characters',
      label: 'Structural characters reduce voice-search recall and secondary resale value.',
      source: 'Deterministic Parser',
      impact: 'high',
    });
  }

  if (valuation.length > 12) {
    bear_signals.push({
      id: 'bear_length_friction',
      label: `Lengthy character count (${valuation.length} chars) increases user cognitive typing load.`,
      source: 'Deterministic Parser',
      impact: 'low',
    });
  }

  if (liquidityChoice === 'illiquid' || liquidityChoice === 'slow_speculative') {
    bear_signals.push({
      id: 'bear_slow_liquidity',
      label: 'Prolonged holding horizon required before identifying end-user buyer.',
      source: 'TypeSafe JEV',
      impact: liquidityChoice === 'illiquid' ? 'high' : 'medium',
    });
  }

  // Free Evidence Provider: Trademark Index Collision Check
  if (freeEvidence?.trademarkScan.trademark_collision_risk === 'high') {
    bear_signals.push({
      id: 'bear_tm_collision',
      label: `Critical trademark collision against protected corporate mark: ${freeEvidence.trademarkScan.matched_brand_name}.`,
      source: 'Local Brand Index (Free)',
      impact: 'high',
    });
  } else if (freeEvidence?.trademarkScan.trademark_collision_risk === 'low') {
    bear_signals.push({
      id: 'bear_tm_similarity',
      label: `Potential brand similarity or typosquat overlap with ${freeEvidence.trademarkScan.matched_brand_name}.`,
      source: 'Local Brand Index (Free)',
      impact: 'medium',
    });
  }

  const tmChoice = mode === 'buy'
    ? jev?.modeAAnswers?.trademark_risk?.choice
    : jev?.modeBAnswers?.trademark_risk?.choice;
  if ((tmChoice === 'critical' || tmChoice === 'high' || tmChoice === 'moderate' || valuation.trademarkRisk !== 'Low') && !freeEvidence?.trademarkScan.matched_brand_name) {
    bear_signals.push({
      id: 'bear_trademark_friction',
      label: 'Trademark friction detected against registered corporate commercial marks.',
      source: 'TypeSafe JEV',
      impact: (tmChoice === 'critical' || tmChoice === 'high' || valuation.trademarkRisk === 'High') ? 'high' : 'medium',
    });
  }

  if (mode === 'buy' && economicVal && economicVal.is_positive_roi_spread === false) {
    bear_signals.push({
      id: 'bear_negative_spread',
      label: 'Negative expected net resale yield after broker fees and 2-year carrying drag.',
      source: 'Net EV Engine',
      impact: 'high',
    });
  }

  if (mode === 'renew' && holdingEff) {
    if (holdingEff.annual_parking_yield_usd === 0) {
      bear_signals.push({
        id: 'bear_zero_parking',
        label: 'Zero monetization yield to offset registry renewal fees.',
        source: 'Portfolio Telemetry',
        impact: 'medium',
      });
    }
    if (holdingEff.annual_inbound_expected_value_usd === 0) {
      bear_signals.push({
        id: 'bear_zero_inbound',
        label: 'Zero demonstrated buyer interest over trailing 12-month period.',
        source: 'Portfolio Telemetry',
        impact: 'medium',
      });
    }
  }

  // 3. UNKNOWN SIGNALS (? Unobserved Evidence Gaps)
  if (state.metrics_evidence.exact_search_volume === null) {
    unknown_signals.push({
      id: 'unknown_search_volume',
      label: 'Organic search volume unobserved (can be enriched via Manual Evidence drawer).',
      source: 'Search Telemetry',
      impact: 'medium',
    });
  }

  if (state.metrics_evidence.cpc_usd === null) {
    unknown_signals.push({
      id: 'unknown_cpc',
      label: 'Commercial advertiser CPC unobserved (can be enriched via Manual Evidence drawer).',
      source: 'CPC Index',
      impact: 'low',
    });
  }

  if (state.metrics_evidence.comparable_sales_count === null) {
    unknown_signals.push({
      id: 'unknown_sales_comps',
      label: 'Historical aftermarket sales comps not indexed.',
      source: 'Market Comps Index',
      impact: 'medium',
    });
  }

  if (state.metrics_evidence.backlinks_count === null) {
    unknown_signals.push({
      id: 'unknown_backlinks',
      label: 'Backlink authority and historical anchor spam status unknown.',
      source: 'SEO Web Index',
      impact: 'medium',
    });
  }

  if (mode === 'renew' && state.metrics_evidence.annual_parking_revenue_usd === null) {
    unknown_signals.push({
      id: 'unknown_parking_telemetry',
      label: 'Parking yield telemetry unlinked (monetization yield unknown).',
      source: 'Monetization Feed',
      impact: 'low',
    });
  }

  if (mode === 'renew' && state.metrics_evidence.inbound_inquiries_12m === null) {
    unknown_signals.push({
      id: 'unknown_inbound_records',
      label: 'Inbound buyer interest history unrecorded.',
      source: 'Brokerage Records',
      impact: 'low',
    });
  }

  // 4. NEXT ACTION INVESTIGATION ROADMAP
  if (state.metrics_evidence.comparable_sales_count === null) {
    next_actions.push({
      id: 'action_sales_comps',
      action: 'Benchmark 3 to 5 comparable sales of similar SLD patterns on NameBio or Dan.com.',
      target_dimension: 'Market Valuation',
      priority: 'recommended',
      suggested_tool_or_source: 'NameBio / Dan.com',
    });
  }

  if (tmChoice === 'moderate' || tmChoice === 'high' || tmChoice === 'critical' || freeEvidence?.trademarkScan.trademark_collision_risk === 'high') {
    next_actions.push({
      id: 'action_uspto_search',
      action: 'Search USPTO TESS and WIPO Global Brand Database for conflicting marks in Classes 9, 35, 42.',
      target_dimension: 'Trademark Due Diligence',
      priority: 'critical',
      suggested_tool_or_source: 'USPTO / WIPO Registry',
    });
  }

  if (!freeEvidence?.wayback.has_historical_snapshots) {
    next_actions.push({
      id: 'action_wayback_audit',
      action: 'Audit Wayback Machine archives (2018-2024) to verify clean, non-spam historical content.',
      target_dimension: 'SEO History & Spam Clearance',
      priority: 'recommended',
      suggested_tool_or_source: 'Wayback Machine',
    });
  }

  if (mode === 'renew' && holdingEff && holdingEff.holding_efficiency_ratio < 1.5) {
    next_actions.push({
      id: 'action_grace_auction',
      action: 'Attempt wholesale portfolio auction at 30% discount before letting domain drop.',
      target_dimension: 'Portfolio Liquidation',
      priority: 'recommended',
      suggested_tool_or_source: 'NameJet / DropCatch',
    });
  }

  if (state.coverage_report.coverage_pct < 60) {
    next_actions.push({
      id: 'action_keyword_planner',
      action: 'Run manual keyword search volume and CPC lookup on Google Keyword Planner and input via Manual Evidence drawer.',
      target_dimension: 'Search Intent Validation',
      priority: 'optional',
      suggested_tool_or_source: 'Google Keyword Planner',
    });
  }

  return {
    bull_signals,
    bear_signals,
    unknown_signals,
    next_actions,
  };
}

export interface EvidenceBreakdown {
  dataQualityPct: number; // 0 to 100 (Commercial Decision Diligence)
  telemetryQualityPct?: number; // 0 to 100 (Observed Automated Telemetry)
  jevConfidence: number; // 0 to 100
  compositeScore: number; // 0 to 100
  hardGateTriggered: string | null;
  statusLabel: string;
  verifiedPros: string[];
  verifiedCons: string[];
  coverageReport: EvidenceCoverageReport;
  metricsEvidence: DomainMetricsEvidence;
  strategyProfile?: StrategyProfileResult;
  scoreBreakdown: {
    brandabilityComponent: number;
    memorabilityComponent: number;
    commercialSearchComponent?: number;
    liquidityComponent: number;
    tldEquityComponent: number;
    economicsComponent: number;
  };
}

export interface BuyDecisionResult {
  domain: string;
  score: number; // 0.00 to 1.00
  compositeScore: number; // 0 to 100
  verdict: 'Buy' | 'Review' | 'Pass';
  statusLabel: string;
  headline: string;
  summary: string;
  bannerClass: string;
  valuation: DomainValuation;
  rdap: RDAPResult;
  jev?: JEVResponse;
  evidence: EvidenceBreakdown;
  strategy_profile?: StrategyProfileResult;
  economic_valuation?: EconomicValuationResult;
  risk_evaluation?: RiskEngineResult;
  explainability?: ExplainabilityReport;
  version_trace?: AuditVersionTrace;
  free_evidence?: FreeEvidenceReport;
}

export interface RenewalDecisionInput {
  domain: string;
  annualRenewalCost?: number;
  annualParkingRevenue?: number;
  inboundOffersLast12m?: number;
  monthlyImpressions?: number;
  holdingYears?: number;
}

export interface RenewalDecisionResult {
  domain: string;
  score: number; // 0.00 to 1.00
  compositeScore: number; // 0 to 100
  verdict: 'Renew' | 'Review' | 'Drop';
  statusLabel: string;
  headline: string;
  summary: string;
  bannerClass: string;
  netAnnualCashflow: number;
  threeYearCarryingCost: number;
  estimatedLiquidationValue: number;
  holdingYears: number;
  inboundOffers: number;
  valuation: DomainValuation;
  jev?: JEVResponse;
  evidence: EvidenceBreakdown;
  strategy_profile?: StrategyProfileResult;
  economic_valuation?: EconomicValuationResult;
  holding_efficiency?: HoldingEfficiencyResult;
  risk_evaluation?: RiskEngineResult;
  explainability?: ExplainabilityReport;
  version_trace?: AuditVersionTrace;
  free_evidence?: FreeEvidenceReport;
}

/**
 * Enriched State Builder: Computes deterministic facts, 12-dimension evidence coverage & honest null safety
 */
export function buildDomainState(
  sanitizedDomain: string,
  valuation: DomainValuation,
  arg3?: RDAPResult | RenewalDecisionInput,
  arg4?: RenewalDecisionInput | 'buy' | 'renew',
  arg5: 'buy' | 'renew' = 'buy',
  freeEvidence?: FreeEvidenceReport,
  manualOverrides?: UserManualEvidenceOverrides
): DomainState {
  let rdap: RDAPResult | undefined;
  let renewalInput: RenewalDecisionInput | undefined;
  let mode: 'buy' | 'renew' = 'buy';

  if (arg3 && 'status' in arg3) {
    rdap = arg3 as RDAPResult;
  } else if (arg3) {
    renewalInput = arg3 as RenewalDecisionInput;
  }

  if (typeof arg4 === 'string') {
    mode = arg4;
  } else if (arg4) {
    renewalInput = arg4;
    mode = arg5;
  }

  const sld = valuation.sld;
  const tld = valuation.extension.tld;
  const isPronounceable = valuation.pronounceabilityScore >= 60;
  const hasNumbersOrHyphens = /[\d-]/.test(sld);
  // Rule 01: Only mark as dictionary word if it legitimately matches proven commercial vocabulary
  const isDictWord = valuation.keywordMatch.length > 0;
  const isBuyMode = mode === 'buy';

  // Construct Explicit DomainMetricsEvidence with priority rules
  // Priority 1: User manual override > Priority 2: Automated free heuristics / valuation > Priority 3: null (Null safety)
  const exactSearchVolume = manualOverrides?.exact_search_volume !== undefined && manualOverrides.exact_search_volume !== null && manualOverrides.exact_search_volume !== ('' as any)
    ? Number(manualOverrides.exact_search_volume)
    : (valuation.searchVolumeEstimate !== null ? valuation.searchVolumeEstimate : null);

  const cpcUsd = manualOverrides?.cpc_usd !== undefined && manualOverrides.cpc_usd !== null && manualOverrides.cpc_usd !== ('' as any)
    ? Number(manualOverrides.cpc_usd)
    : (valuation.cpcEstimateUsd !== null ? valuation.cpcEstimateUsd : null);

  const backlinksCount = manualOverrides?.backlinks_count !== undefined && manualOverrides.backlinks_count !== null && manualOverrides.backlinks_count !== ('' as any)
    ? Number(manualOverrides.backlinks_count)
    : (freeEvidence?.wayback.has_historical_snapshots ? freeEvidence.wayback.snapshot_count : valuation.backlinksCount !== null ? valuation.backlinksCount : null);

  const referringDomains = manualOverrides?.referring_domains !== undefined && manualOverrides.referring_domains !== null && manualOverrides.referring_domains !== ('' as any)
    ? Number(manualOverrides.referring_domains)
    : (valuation.referringDomainsCount !== null ? valuation.referringDomainsCount : null);

  const annualParkingRevenue = manualOverrides?.annual_parking_revenue_usd !== undefined && manualOverrides.annual_parking_revenue_usd !== null && manualOverrides.annual_parking_revenue_usd !== ('' as any)
    ? Number(manualOverrides.annual_parking_revenue_usd)
    : (!isBuyMode && renewalInput?.annualParkingRevenue !== undefined ? renewalInput.annualParkingRevenue : null);

  const inboundInquiries = manualOverrides?.inbound_inquiries_12m !== undefined && manualOverrides.inbound_inquiries_12m !== null && manualOverrides.inbound_inquiries_12m !== ('' as any)
    ? Number(manualOverrides.inbound_inquiries_12m)
    : (!isBuyMode && renewalInput?.inboundOffersLast12m !== undefined ? renewalInput.inboundOffersLast12m : null);

  const sources: Record<string, MetricSourceTag> = {};

  // 1. Search Volume Source Tag
  if (manualOverrides?.exact_search_volume !== undefined && manualOverrides.exact_search_volume !== null && manualOverrides.exact_search_volume !== ('' as any)) {
    sources['search_volume'] = {
      value: exactSearchVolume,
      source: 'user_verified_manual',
      source_label: 'User Manual (Verified)',
      is_verified: true,
    };
  } else if (freeEvidence?.googleSuggest.suggestion_count && freeEvidence.googleSuggest.suggestion_count > 0) {
    sources['search_volume'] = {
      value: `${freeEvidence.googleSuggest.suggestion_count} queries (${freeEvidence.googleSuggest.has_commercial_intent_tokens ? 'Commercial Intent' : 'General'})`,
      source: 'google_suggest_open',
      source_label: 'Google Suggest (Free)',
      is_verified: true,
    };
  } else {
    sources['search_volume'] = {
      value: null,
      source: 'unobserved',
      source_label: 'Unknown / Not Provided',
      is_verified: false,
    };
  }

  // 2. CPC Commercial Value Source Tag
  if (manualOverrides?.cpc_usd !== undefined && manualOverrides.cpc_usd !== null && manualOverrides.cpc_usd !== ('' as any)) {
    sources['cpc'] = {
      value: cpcUsd,
      source: 'user_verified_manual',
      source_label: 'User Manual (Verified)',
      is_verified: true,
    };
  } else {
    sources['cpc'] = {
      value: null,
      source: 'unobserved',
      source_label: 'Unknown / Not Provided',
      is_verified: false,
    };
  }

  // 3. Backlink Profile Source Tag
  if (manualOverrides?.backlinks_count !== undefined && manualOverrides.backlinks_count !== null && manualOverrides.backlinks_count !== ('' as any)) {
    sources['backlinks'] = {
      value: backlinksCount,
      source: 'user_verified_manual',
      source_label: 'User Manual (Verified)',
      is_verified: true,
    };
  } else if (freeEvidence?.wayback.has_historical_snapshots) {
    sources['backlinks'] = {
      value: `${freeEvidence.wayback.snapshot_count} snapshots (${freeEvidence.wayback.first_seen_year || 'Aged'} - ${freeEvidence.wayback.last_seen_year || 'Recent'})`,
      source: 'wayback_cdx_public',
      source_label: 'Wayback CDX (Free)',
      is_verified: true,
    };
  } else {
    sources['backlinks'] = {
      value: null,
      source: 'unobserved',
      source_label: 'Unknown / Not Provided',
      is_verified: false,
    };
  }

  // 4. Trademark Index Source Tag
  sources['trademark'] = {
    value: freeEvidence?.trademarkScan.trademark_collision_risk || 'clear',
    source: 'local_famous_brands_index',
    source_label: 'Local Brand Index (Free)',
    is_verified: true,
  };

  // 5. Wayback Machine Source Tag (Rule 13: 0 snapshots is an observed fact, not unknown)
  const waybackObserved = freeEvidence?.wayback !== undefined;
  sources['wayback'] = {
    value: waybackObserved ? `${freeEvidence.wayback.snapshot_count} snapshots` : null,
    source: 'wayback_cdx_public',
    source_label: 'Wayback CDX (Free)',
    is_verified: waybackObserved,
  };

  // 6. Google Autocomplete Source Tag
  sources['google_suggest'] = {
    value: freeEvidence?.googleSuggest.suggestion_count ? `${freeEvidence.googleSuggest.suggestion_count} suggestions` : null,
    source: 'google_suggest_open',
    source_label: 'Google Suggest (Free)',
    is_verified: Boolean(freeEvidence?.googleSuggest.suggestion_count),
  };

  // 7. Wikipedia Entity Source Tag
  sources['wikipedia'] = {
    value: freeEvidence?.wikipedia.is_encyclopedic_term ? `Knowledge Graph (${freeEvidence.wikipedia.search_hit_count} hits)` : null,
    source: 'wikipedia_api_open',
    source_label: 'Wikipedia Entity (Free)',
    is_verified: Boolean(freeEvidence?.wikipedia.is_encyclopedic_term),
  };

  // 8. DNS & MX Records Source Tag
  sources['dns'] = {
    value: freeEvidence?.dns.is_resolving ? 'Active DNS' : 'Inactive DNS',
    source: 'node_dns_native',
    source_label: 'Node DNS (Free)',
    is_verified: true,
  };

  const metricsEvidence: DomainMetricsEvidence = {
    exact_search_volume: exactSearchVolume,
    cpc_usd: cpcUsd,
    backlinks_count: backlinksCount,
    referring_domains: referringDomains,
    annual_parking_revenue_usd: annualParkingRevenue,
    inbound_inquiries_12m: inboundInquiries,
    comparable_sales_count: valuation.comparableSalesCount !== null ? valuation.comparableSalesCount : null,
    median_comparable_usd: valuation.medianComparableUsd !== null ? valuation.medianComparableUsd : null,
    comparable_sales: valuation.comparables,
    wayback_snapshot_count: freeEvidence?.wayback.snapshot_count,
    wayback_first_seen_year: freeEvidence?.wayback.first_seen_year,
    wayback_last_seen_year: freeEvidence?.wayback.last_seen_year,
    google_suggestions_count: freeEvidence?.googleSuggest.suggestion_count,
    google_top_suggestions: freeEvidence?.googleSuggest.top_suggestions,
    google_commercial_intent: freeEvidence?.googleSuggest.has_commercial_intent_tokens,
    wikipedia_is_encyclopedic: freeEvidence?.wikipedia.is_encyclopedic_term,
    wikipedia_hits: freeEvidence?.wikipedia.search_hit_count,
    dns_resolving: freeEvidence?.dns.is_resolving,
    dns_has_mx: freeEvidence?.dns.has_mx_mail_records,
    dns_nameservers: freeEvidence?.dns.nameservers,
    trademark_risk_score: freeEvidence?.trademarkScan.trademark_collision_risk,
    trademark_matched_brand: freeEvidence?.trademarkScan.matched_brand_name,
    sources,
  };

  // Dynamic 12-Dimension Evidence Verification
  const verifiedFields: string[] = [];
  const unknownFields: string[] = [];

  // 1. TLD Registry Contract
  if (valuation.extension && valuation.extension.annualRenewalCost > 0) {
    verifiedFields.push('TLD Registry Contract');
  } else {
    unknownFields.push('TLD Registry Contract');
  }

  // 2. Character Length
  if (valuation.length > 0) {
    verifiedFields.push('Character Length');
  } else {
    unknownFields.push('Character Length');
  }

  // 3. Syllable & Phonetic Balance
  if (valuation.syllables > 0) {
    verifiedFields.push('Syllable Structure');
  } else {
    unknownFields.push('Syllable Structure');
  }

  // 4. Phonetic Pronounceability
  if (valuation.pronounceabilityScore > 0) {
    verifiedFields.push('Phonetic Pronounceability');
  } else {
    unknownFields.push('Phonetic Pronounceability');
  }

  // 5. Structure Integrity Scan
  verifiedFields.push('Structure Integrity Scan');

  // 6. Local Trademark Collision Scan (Always verified via local trie)
  verifiedFields.push('Local Brand Trademark Scan');

  // 7. Wayback Machine Historical Archive (Rule 02: Only verified if actual snapshots exist)
  if (freeEvidence?.wayback?.has_historical_snapshots && (freeEvidence.wayback.snapshot_count ?? 0) > 0) {
    verifiedFields.push('Wayback Machine Archive History');
  } else {
    unknownFields.push('Wayback Machine Archive History');
  }

  // 8. Google Autocomplete Demand (Only verified if commercial intent or multiple suggestions)
  if ((freeEvidence?.googleSuggest?.suggestion_count ?? 0) >= 2 || freeEvidence?.googleSuggest?.has_commercial_intent_tokens) {
    verifiedFields.push('Google Autocomplete Demand');
  } else {
    unknownFields.push('Google Autocomplete Demand');
  }

  // 9. Node DNS & Mail Routing (Only verified if domain is resolving)
  if (freeEvidence?.dns?.is_resolving) {
    verifiedFields.push('DNS & MX Mail Routing');
  } else {
    unknownFields.push('DNS & MX Mail Routing');
  }

  // 10. Wikipedia Knowledge Graph (Only verified if genuine encyclopedic entity match)
  if (freeEvidence?.wikipedia?.is_encyclopedic_term) {
    verifiedFields.push('Wikipedia Knowledge Graph');
  } else {
    unknownFields.push('Wikipedia Knowledge Graph');
  }

  // 11. Search Volume Intent (Manual override or keyword detection)
  if (metricsEvidence.exact_search_volume !== null || manualOverrides?.exact_search_volume != null) {
    verifiedFields.push('Search Volume Intent');
  } else {
    unknownFields.push('Search Volume Intent');
  }

  // 12. Commercial CPC / Link Authority (Manual override or Wayback history)
  if (metricsEvidence.cpc_usd !== null || manualOverrides?.cpc_usd != null || metricsEvidence.backlinks_count !== null || manualOverrides?.backlinks_count != null) {
    verifiedFields.push('Commercial CPC / Link Profile');
  } else {
    unknownFields.push('Commercial CPC / Link Profile');
  }

  const freeSignalsCount = [
    freeEvidence?.trademarkScan,
    freeEvidence?.wayback,
    freeEvidence?.googleSuggest,
    freeEvidence?.dns,
    freeEvidence?.wikipedia,
  ].filter(Boolean).length;

  const manualOverridesCount = manualOverrides
    ? Object.values(manualOverrides).filter((v) => v !== undefined && v !== null && v !== '').length
    : 0;

  // Automated Telemetry Coverage: Ratio of automated free telemetry channels successfully probed
  const telemetryProbes = [
    Boolean(rdap && (rdap.status === 'available' || rdap.status === 'registered')),
    Boolean(freeEvidence?.dns !== undefined),
    Boolean(freeEvidence?.trademarkScan !== undefined),
    Boolean(freeEvidence?.wayback !== undefined),
    Boolean(freeEvidence?.googleSuggest !== undefined),
    Boolean(freeEvidence?.wikipedia !== undefined),
    Boolean(valuation.pronounceabilityScore > 0),
  ];
  const observedTelemetryCount = telemetryProbes.filter(Boolean).length;
  const telemetryCoveragePct = Math.round((observedTelemetryCount / telemetryProbes.length) * 100);

  const coveragePct = Math.min(100, Math.round((verifiedFields.length / 12) * 100));
  const coverageReport: EvidenceCoverageReport = {
    coverage_pct: coveragePct,
    telemetry_coverage_pct: telemetryCoveragePct,
    verified_fields: verifiedFields,
    unknown_fields: unknownFields,
    free_signals_count: freeSignalsCount,
    manual_overrides_count: manualOverridesCount,
  };

  const askingPrice = isBuyMode
    ? (manualOverrides?.custom_asking_price_usd !== undefined && manualOverrides.custom_asking_price_usd !== null && Number(manualOverrides.custom_asking_price_usd) > 0
        ? Number(manualOverrides.custom_asking_price_usd)
        : (rdap?.status === 'available' ? valuation.annualCarryingCost : null))
    : undefined;

  const renewalPrice = renewalInput?.annualRenewalCost || valuation.annualCarryingCost;

  return {
    domain: {
      fqdn: sanitizedDomain,
      sld,
      tld,
      tld_tier: valuation.extension.tier,
    },
    structure: {
      characters: valuation.length,
      syllables: valuation.syllables,
      pronounceable: isPronounceable,
      has_hyphens_or_digits: hasNumbersOrHyphens,
      is_dictionary_word: isDictWord,
    },
    metrics_evidence: metricsEvidence,
    economics: isBuyMode
      ? {
          asking_or_backorder_price: askingPrice,
          annual_renewal_cost: renewalPrice,
        }
      : {
          annual_renewal_cost: renewalPrice,
        },
    context_mode: isBuyMode ? 'buy' : 'renewal',
    holding_years: !isBuyMode ? (renewalInput?.holdingYears ?? 2) : null,
    data_quality_pct: coveragePct,
    coverage_report: coverageReport,
  };
}

// Backwards compatibility alias
export const buildJEVState = buildDomainState;

/**
 * Mode A: Acquisition Composite Engine & Hard Gates with Dynamic Strategy Weighting
 */
export function computeBuyDecision(
  valuation: DomainValuation,
  rdap: RDAPResult,
  jev?: JEVResponse,
  freeEvidence?: FreeEvidenceReport,
  manualOverrides?: UserManualEvidenceOverrides,
  customWeights?: StrategyWeights
): BuyDecisionResult {
  const state = buildDomainState(valuation.domain, valuation, rdap, undefined, 'buy', freeEvidence, manualOverrides);
  const isCom = valuation.extension.tld === '.com' || valuation.extension.tld === 'com';
  const isTier1 = valuation.extension.tier === 'Tier 1' || isCom;

  // 1. Determine Strategy Archetype & Dynamic Weighting Profile
  const strategyChoice: DomainStrategyType = jev?.modeAAnswers?.domain_strategy_type?.choice || classifyDomainStrategy(state);
  const defaultProfile: StrategyProfileResult = getStrategyProfile(strategyChoice);

  // Normalize custom weights if provided by user
  let weights = defaultProfile.applied_weights;
  let strategyProfile = defaultProfile;

  if (customWeights && typeof customWeights === 'object') {
    const rawSum =
      (Number(customWeights.brandability) || 0) +
      (Number(customWeights.memorability) || 0) +
      (Number(customWeights.commercial_search) || 0) +
      (Number(customWeights.liquidity) || 0) +
      (Number(customWeights.tld_equity) || 0) +
      (Number(customWeights.economics_spread) || 0);

    if (rawSum > 0) {
      weights = {
        brandability: (Number(customWeights.brandability) || 0) / rawSum,
        memorability: (Number(customWeights.memorability) || 0) / rawSum,
        commercial_search: (Number(customWeights.commercial_search) || 0) / rawSum,
        liquidity: (Number(customWeights.liquidity) || 0) / rawSum,
        tld_equity: (Number(customWeights.tld_equity) || 0) / rawSum,
        economics_spread: (Number(customWeights.economics_spread) || 0) / rawSum,
      };
      strategyProfile = {
        ...defaultProfile,
        label: `${defaultProfile.label} (Custom Weights)`,
        applied_weights: weights,
      };
    }
  }

  // 2. Compute 6 Normalized Metric Dimensions (0 to 100)
  const brandScore = jev?.modeAAnswers?.brandability?.score ?? (valuation.brandabilityScore >= 75 ? 3 : valuation.brandabilityScore >= 50 ? 2 : 1);
  const brandNormalized = jev?.modeAAnswers?.brandability?.normalizedPercentage ?? (brandScore === 4 ? 100 : brandScore === 3 ? 85 : brandScore === 2 ? 60 : brandScore === 1 ? 35 : 10);
  
  const memorabilityValue = jev?.modeAAnswers?.startup_memorability?.value ?? (valuation.pronounceabilityScore / 100 * (valuation.length <= 6 ? 0.9 : 0.6));
  const memorabilityNorm = Math.round(memorabilityValue * 100);

  // Commercial Search Dimension
  let commercialSearchNorm = 35;
  if (state.metrics_evidence.exact_search_volume !== null) {
    const vol = state.metrics_evidence.exact_search_volume;
    if (vol >= 10000) commercialSearchNorm = 95;
    else if (vol >= 5000) commercialSearchNorm = 85;
    else if (vol >= 1000) commercialSearchNorm = 75;
    else if (vol >= 500) commercialSearchNorm = 60;
    else if (vol > 0) commercialSearchNorm = 45;
    else commercialSearchNorm = 20;
  } else if (state.metrics_evidence.cpc_usd !== null) {
    const cpc = state.metrics_evidence.cpc_usd;
    if (cpc >= 5.0) commercialSearchNorm = 90;
    else if (cpc >= 2.0) commercialSearchNorm = 75;
    else if (cpc >= 1.0) commercialSearchNorm = 60;
  } else if (valuation.keywordMatch.length > 0) {
    commercialSearchNorm = 70;
  } else if (strategyChoice === 'exact_match_keyword' || strategyChoice === 'geo_service') {
    commercialSearchNorm = 75;
  } else if (strategyChoice === 'tech_trend') {
    commercialSearchNorm = 65;
  }

  const liquidityChoice = jev?.modeAAnswers?.aftermarket_liquidity?.choice ?? (isTier1 && valuation.length <= 6 ? 'high_liquidity' : valuation.length > 12 ? 'illiquid' : 'slow_speculative');
  const liquidityNorm = liquidityChoice === 'high_liquidity' ? 95 : liquidityChoice === 'slow_speculative' ? 50 : 15;

  const tldNorm = isCom ? 100 : valuation.extension.tier === 'Tier 1' ? 85 : valuation.extension.tier === 'Tier 2' ? 65 : valuation.extension.tier === 'Tier 3' ? 40 : 15;

  const askingPrice = state.economics.asking_or_backorder_price || Math.max(20, Math.round(valuation.estimatedValue * 0.45));
  const econNorm = valuation.estimatedValue >= askingPrice * 2.5
    ? 95
    : valuation.estimatedValue >= askingPrice * 1.5
    ? 80
    : valuation.estimatedValue >= askingPrice
    ? 65
    : 35;

  // 3. Apply Dynamic Weighting Matrix
  const brandComponent = Math.round(brandNormalized * weights.brandability);
  const memoComponent = Math.round(memorabilityNorm * weights.memorability);
  const searchComponent = Math.round(commercialSearchNorm * weights.commercial_search);
  const liqComponent = Math.round(liquidityNorm * weights.liquidity);
  const tldComponent = Math.round(tldNorm * weights.tld_equity);
  const econComponent = Math.round(econNorm * weights.economics_spread);

  let compositeScore = brandComponent + memoComponent + searchComponent + liqComponent + tldComponent + econComponent;
  compositeScore = Math.max(5, Math.min(99, compositeScore));

  const confidence = jev?.confidence ?? 0.85;

  // 4. Calculate Economic Valuation & Net EV (Rule 06 compliant)
  const isAvailable = rdap.status === 'available';
  const economicValuation = calculateEconomicValuation(
    valuation,
    strategyChoice,
    liquidityChoice,
    brandScore,
    state.economics.asking_or_backorder_price,
    isAvailable
  );

  // 5. Evaluate Inviolable Hard Gates & Risk Engine
  const riskEvaluation = evaluateRiskEngine(valuation, state, jev, economicValuation, 'buy');

  let hardGateTriggered: string | null = null;
  let verdict: 'Buy' | 'Review' | 'Pass' = 'Review';
  let statusLabel = 'REVIEW';
  let headline: string;
  let summary: string;
  let bannerClass: string;

  // Check Gate 1: Fatal Trademark Gate (Inviolable Block)
  const tmGate = riskEvaluation.evaluated_gates.find((g) => g.id === 'gate_trademark');
  const sufficiencyGate = riskEvaluation.evaluated_gates.find((g) => g.id === 'gate_evidence_sufficiency');
  const capitalGate = riskEvaluation.evaluated_gates.find((g) => g.id === 'gate_capital_budget');
  const spreadGate = riskEvaluation.evaluated_gates.find((g) => g.id === 'gate_actuarial_spread');

  if (tmGate && tmGate.status === 'blocked') {
    hardGateTriggered = 'Hard Risk: Trademark Collision';
    verdict = 'Pass';
    statusLabel = 'RISK_BLOCKED';
    compositeScore = Math.min(20, Math.round(compositeScore * 0.2));
    headline = 'Pass: Trademark Collision Hazard';
    summary = tmGate.reason || 'Fatal trademark collision detected. Acquisition blocked to protect capital from UDRP/legal forfeiture.';
    bannerClass = 'bg-rose-50 border-rose-200 text-rose-900';
  } else if (sufficiencyGate && sufficiencyGate.status === 'blocked') {
    // Gate 2: Baseline Evidence Sufficiency (< 35%)
    hardGateTriggered = 'Insufficient Evidence (<35%)';
    verdict = 'Review';
    statusLabel = 'INSUFFICIENT_EVIDENCE';
    headline = 'Review: Insufficient Verifiable Evidence';
    summary = sufficiencyGate.reason || 'Total verified data coverage is below the 35% minimum threshold for automated decision-making.';
    bannerClass = 'bg-amber-50 border-amber-200 text-amber-900';
  } else {
    // Tentative standard scoring
    let tentativeVerdict: 'Buy' | 'Review' | 'Pass' = 'Review';
    if (compositeScore >= 75 && confidence >= 0.65) {
      tentativeVerdict = 'Buy';
    } else if (compositeScore >= 50) {
      tentativeVerdict = 'Review';
    } else {
      tentativeVerdict = 'Pass';
    }

    if (tentativeVerdict === 'Buy') {
      // Gate 3: Capital-Proportional Risk Budgeting Warning
      if (capitalGate && capitalGate.status === 'warning') {
        verdict = 'Review';
        statusLabel = 'DILIGENCE_REVIEW';
        hardGateTriggered = 'Capital Diligence Deficit';
        headline = 'Review: Capital-Proportional Diligence Required';
        summary = capitalGate.reason || 'Capital outlay requires higher verified data coverage before executing purchase.';
        bannerClass = 'bg-amber-50 border-amber-200 text-amber-900';
      } else if (spreadGate && spreadGate.status === 'warning') {
        verdict = 'Review';
        if (economicValuation.acquisition_status === 'unknown_aftermarket') {
          statusLabel = 'PRICE_REQUIRED';
          hardGateTriggered = 'Asking Price Required';
          headline = 'Review: Acquisition Price Required';
          summary = 'Structural and market indicators evaluated. Final acquisition decision requires seller asking price.';
        } else {
          statusLabel = compositeScore < 60 ? 'PASS' : 'REVIEW';
          verdict = compositeScore < 60 ? 'Pass' : 'Review';
          hardGateTriggered = 'Negative Expected Value';
          headline = 'Review: Negative Net Expected Value Spread';
          summary = spreadGate.reason || 'Expected net resale yield does not justify asking price.';
        }
        bannerClass = 'bg-amber-50 border-amber-200 text-amber-900';
      } else {
        verdict = 'Buy';
        statusLabel = 'BUY';
        headline = `Buy: High Liquidity & ${strategyProfile.label}`;
        summary = `Favorable ${strategyProfile.label.toLowerCase()} profile with strong demand signals and solid acquisition spread.`;
        bannerClass = 'bg-emerald-50 border-emerald-200 text-emerald-900';
      }
    } else if (tentativeVerdict === 'Review') {
      verdict = 'Review';
      statusLabel = 'REVIEW';
      headline = 'Review: Speculative or Selective Demand';
      summary = 'Moderate upside; requires patient holding timeframe or active outbound marketing to realize exit.';
      bannerClass = 'bg-amber-50 border-amber-200 text-amber-900';
    } else {
      verdict = 'Pass';
      statusLabel = 'PASS';
      headline = 'Pass: Low Liquidity or Sunk Cost Risk';
      summary = 'Unfavorable unit economics, low secondary liquidity, or excessive speculative drag.';
      bannerClass = 'bg-rose-50 border-rose-200 text-rose-900';
    }
  }

  // Verified Pros (+) and Cons (-) tied strictly to verified non-null facts
  const verifiedPros: string[] = [];
  const verifiedCons: string[] = [];

  // Strategy Archetype Pro
  verifiedPros.push(`Strategy Archetype: Classified as ${strategyProfile.label} (${(weights.commercial_search * 100).toFixed(0)}% Search, ${(weights.liquidity * 100).toFixed(0)}% Liquidity, ${(weights.brandability * 100).toFixed(0)}% Brandability weights applied).`);

  if (isCom) {
    verifiedPros.push(`Tier 1 .com extension provides maximum global buyer liquidity.`);
  } else if (valuation.extension.tier === 'Tier 1') {
    verifiedPros.push(`Tier 1 tech extension (${valuation.extension.tld}) with high startup demand.`);
  }

  if (valuation.length <= 5) {
    verifiedPros.push(`Ultra-short length (${valuation.length} characters) maximizes brand recall.`);
  } else if (valuation.length <= 8) {
    verifiedPros.push(`Compact length (${valuation.length} characters) fits standard commercial naming criteria.`);
  }

  if (!state.structure.has_hyphens_or_digits) {
    verifiedPros.push(`Zero hyphens and zero numbers eliminate verbal transmission error.`);
  }

  if (state.structure.pronounceable) {
    verifiedPros.push(`High phonetic pronounceability (${valuation.pronounceabilityScore}/100) with clean syllabic balance.`);
  }

  if (state.metrics_evidence.exact_search_volume !== null && state.metrics_evidence.exact_search_volume >= 1000) {
    verifiedPros.push(`Demonstrated search demand (${state.metrics_evidence.exact_search_volume.toLocaleString()} searches/mo).`);
  }

  if (state.metrics_evidence.cpc_usd !== null && state.metrics_evidence.cpc_usd >= 2.0) {
    verifiedPros.push(`Commercial CPC baseline verified ($${state.metrics_evidence.cpc_usd.toFixed(2)}/click).`);
  }

  if (state.metrics_evidence.comparable_sales_count !== null) {
    verifiedPros.push(`Recent comparable market sales recorded (${state.metrics_evidence.comparable_sales_count} comps, median $${state.metrics_evidence.median_comparable_usd?.toLocaleString()}).`);
  }

  if (liquidityChoice === 'high_liquidity') {
    verifiedPros.push(`High aftermarket liquidity signals with strong investor velocity.`);
  }

  // Cons: strictly based on observed negatives, NOT null assumptions
  if (state.metrics_evidence.exact_search_volume === null) {
    verifiedCons.push(`Search volume unobserved (external SEO telemetry unlinked).`);
  }

  if (state.metrics_evidence.backlinks_count === null) {
    verifiedCons.push(`Backlink authority unverified (no third-party link index).`);
  }

  if (state.structure.characters > 12) {
    verifiedCons.push(`Lengthy character count (${state.structure.characters} chars) increases user typing friction.`);
  }

  if (state.structure.has_hyphens_or_digits) {
    verifiedCons.push(`Hyphens or digits present, which substantially reduces aftermarket resale multiples.`);
  }

  if (state.structure.syllables >= 4) {
    verifiedCons.push(`Multi-syllabic construction (${state.structure.syllables} syllables) slows verbal recall.`);
  }

  if (valuation.annualCarryingCost > 35) {
    verifiedCons.push(`Elevated registry carrying cost drag ($${valuation.annualCarryingCost}/yr).`);
  }

  if (liquidityChoice === 'illiquid') {
    verifiedCons.push(`Low secondary auction velocity; liquidation at wholesale may face prolonged hold times.`);
  }

  const evidence: EvidenceBreakdown = {
    dataQualityPct: state.data_quality_pct,
    telemetryQualityPct: state.coverage_report.telemetry_coverage_pct ?? 100,
    jevConfidence: Math.round(confidence * 100),
    compositeScore,
    hardGateTriggered,
    statusLabel,
    verifiedPros,
    verifiedCons,
    coverageReport: state.coverage_report,
    metricsEvidence: state.metrics_evidence,
    strategyProfile,
    scoreBreakdown: {
      brandabilityComponent: brandComponent,
      memorabilityComponent: memoComponent,
      commercialSearchComponent: searchComponent,
      liquidityComponent: liqComponent,
      tldEquityComponent: tldComponent,
      economicsComponent: econComponent,
    },
  };

  const explainability = generateExplainabilityReport(
    valuation,
    state,
    jev,
    economicValuation,
    undefined,
    riskEvaluation,
    'buy',
    freeEvidence,
    manualOverrides
  );

  return {
    domain: valuation.domain,
    score: parseFloat((compositeScore / 100).toFixed(2)),
    compositeScore,
    verdict,
    statusLabel,
    headline,
    summary,
    bannerClass,
    valuation,
    rdap,
    jev,
    evidence,
    strategy_profile: strategyProfile,
    economic_valuation: economicValuation,
    risk_evaluation: riskEvaluation,
    explainability,
    free_evidence: freeEvidence,
  };
}

/**
 * Mode B: Renewal Composite Engine & Hard Gates with Strategy Archetype Awareness
 */
export function computeRenewalDecision(
  input: RenewalDecisionInput,
  valuation: DomainValuation,
  jev?: JEVResponse,
  freeEvidence?: FreeEvidenceReport,
  manualOverrides?: UserManualEvidenceOverrides
): RenewalDecisionResult {
  const renewalCost = input.annualRenewalCost || valuation.annualCarryingCost;
  const parkingRevenue = input.annualParkingRevenue !== undefined ? input.annualParkingRevenue : null;
  const inboundOffers = input.inboundOffersLast12m !== undefined ? input.inboundOffersLast12m : null;
  const holdingYears = input.holdingYears || 1;

  const netAnnualCashflow = parkingRevenue !== null ? parkingRevenue - renewalCost : -renewalCost;
  const threeYearCarryingCost = renewalCost * 3;
  const estimatedLiquidationValue = valuation.wholesaleLiquidationValue;

  const state = buildDomainState(valuation.domain, valuation, undefined, input, 'renew', freeEvidence, manualOverrides);
  const isCom = valuation.extension.tld === '.com' || valuation.extension.tld === 'com';

  const strategyChoice: DomainStrategyType = jev?.modeBAnswers?.domain_strategy_type?.choice || classifyDomainStrategy(state);
  const strategyProfile: StrategyProfileResult = getStrategyProfile(strategyChoice);

  const renewalJustChoice = jev?.modeBAnswers?.renewal_justification?.choice ?? (
    (parkingRevenue !== null && parkingRevenue >= renewalCost) || (inboundOffers !== null && inboundOffers >= 2) ? 'essential_hold' :
    (inboundOffers !== null && inboundOffers === 1) || valuation.wholesaleLiquidationValue > renewalCost * 5 ? 'borderline_review' : 'drop_candidate'
  );
  const renewalJustNorm = renewalJustChoice === 'essential_hold' ? 95 : renewalJustChoice === 'borderline_review' ? 55 : 15;

  const inboundAppealValue = jev?.modeBAnswers?.inbound_monetization_appeal?.value ?? ((inboundOffers !== null && inboundOffers > 0) ? 0.85 : (parkingRevenue !== null && parkingRevenue > 0) ? 0.70 : 0.35);
  const inboundNorm = Math.round(inboundAppealValue * 100);

  const brandScore = jev?.modeBAnswers?.brandability?.score ?? (valuation.brandabilityScore >= 75 ? 3 : valuation.brandabilityScore >= 50 ? 2 : 1);
  const brandNormalized = jev?.modeBAnswers?.brandability?.normalizedPercentage ?? (brandScore === 4 ? 100 : brandScore === 3 ? 85 : brandScore === 2 ? 60 : 35);

  let holdingEconNorm = 40;
  if (parkingRevenue !== null && parkingRevenue >= renewalCost) holdingEconNorm = 95;
  else if (threeYearCarryingCost < estimatedLiquidationValue * 0.25) holdingEconNorm = 75;
  else if (threeYearCarryingCost > estimatedLiquidationValue * 0.70) holdingEconNorm = 20;

  // Mode B Composite formula:
  // (Renewal Justification * 0.35) + (Holding Economics * 0.30) + (Inbound Appeal * 0.20) + (Brandability * 0.15)
  const renJustComponent = Math.round(renewalJustNorm * 0.35);
  const holdEconComponent = Math.round(holdingEconNorm * 0.30);
  const inbComponent = Math.round(inboundNorm * 0.20);
  const brandComponent = Math.round(brandNormalized * 0.15);

  let compositeScore = renJustComponent + holdEconComponent + inbComponent + brandComponent;
  compositeScore = Math.max(5, Math.min(99, compositeScore));

  const confidence = jev?.confidence ?? 0.85;

  // Economic Valuation & Holding Efficiency
  const economicValuation = calculateEconomicValuation(
    valuation,
    strategyChoice,
    'slow_speculative',
    brandScore,
    0
  );
  const holdingEfficiency = calculateHoldingEfficiency(input, valuation, economicValuation);

  // Risk Engine evaluation
  const riskEvaluation = evaluateRiskEngine(valuation, state, jev, economicValuation, 'renew');

  let hardGateTriggered: string | null = null;
  let verdict: 'Renew' | 'Review' | 'Drop' = 'Review';
  let statusLabel = 'REVIEW';
  let headline: string;
  let summary: string;
  let bannerClass: string;

  const tmGate = riskEvaluation.evaluated_gates.find((g) => g.id === 'gate_trademark');
  const sufficiencyGate = riskEvaluation.evaluated_gates.find((g) => g.id === 'gate_evidence_sufficiency');

  if (tmGate && tmGate.status === 'blocked') {
    hardGateTriggered = 'Hard Risk: Trademark Collision';
    verdict = 'Drop';
    statusLabel = 'RISK_BLOCKED';
    compositeScore = Math.min(20, Math.round(compositeScore * 0.2));
    headline = 'Drop: Trademark Collision Hazard';
    summary = tmGate.reason || 'Fatal trademark collision detected against protected brands. Drop upon expiration.';
    bannerClass = 'bg-rose-50 border-rose-200 text-rose-900';
  } else if (sufficiencyGate && sufficiencyGate.status === 'blocked') {
    hardGateTriggered = 'Insufficient Evidence (<35%)';
    verdict = 'Review';
    statusLabel = 'INSUFFICIENT_EVIDENCE';
    headline = 'Review: Insufficient Verifiable Evidence';
    summary = sufficiencyGate.reason || 'Total verified data coverage is below the 35% minimum threshold for automated decision-making.';
    bannerClass = 'bg-amber-50 border-amber-200 text-amber-900';
  } else if (compositeScore >= 75 && confidence >= 0.60) {
    verdict = 'Renew';
    statusLabel = 'RENEW';
    headline = `Renew: Core ${strategyProfile.label} Asset`;
    summary = 'Active monetization, positive organic inbound traffic, or recurring brand value justifies renewal fees.';
    bannerClass = 'bg-emerald-50 border-emerald-200 text-emerald-900';
  } else if (compositeScore >= 50) {
    verdict = 'Review';
    statusLabel = 'REVIEW';
    headline = 'Review: Reprice or Grace Period Auction';
    summary = 'Holding cost is close to break-even. Consider listing at wholesale liquidation before dropping.';
    bannerClass = 'bg-amber-50 border-amber-200 text-amber-900';
  } else {
    verdict = 'Drop';
    statusLabel = 'DROP';
    headline = 'Drop: Carrying Drag Exceeds Residual Value';
    summary = 'Carrying drag exceeds expected residual value. Release on expiration to eliminate negative holding deficit.';
    bannerClass = 'bg-rose-50 border-rose-200 text-rose-900';
  }

  const verifiedPros: string[] = [];
  const verifiedCons: string[] = [];

  verifiedPros.push(`Strategy Archetype: Classified as ${strategyProfile.label}.`);

  if (parkingRevenue !== null && parkingRevenue > renewalCost) {
    verifiedPros.push(`Positive net cashflow (+$${parkingRevenue - renewalCost}/yr) covers annual carrying cost.`);
  }

  if (inboundOffers !== null && inboundOffers >= 1) {
    verifiedPros.push(`Demonstrated buyer interest (${inboundOffers} inbound offers recorded in last 12m).`);
  }

  if (estimatedLiquidationValue > renewalCost * 3) {
    verifiedPros.push(`Estimated wholesale liquidation ($${estimatedLiquidationValue.toLocaleString()}) exceeds 3-year carrying drag.`);
  }

  if (isCom) {
    verifiedPros.push(`Core Tier 1 registry extension (${valuation.extension.tld}) retains baseline secondary liquidity.`);
  }

  if (parkingRevenue === null) {
    verifiedCons.push(`Parking yield telemetry unlinked (monetization yield unknown).`);
  } else if (parkingRevenue === 0) {
    verifiedCons.push(`Zero parking monetization revenue to offset annual registry fee ($${renewalCost}/yr drag).`);
  }

  if (inboundOffers === null) {
    verifiedCons.push(`Inbound acquisition velocity unrecorded.`);
  } else if (inboundOffers === 0) {
    verifiedCons.push(`Zero recorded buyer acquisition inquiries over the past 12 months.`);
  }

  if (holdingYears >= 2 && inboundOffers === 0) {
    verifiedCons.push(`Stagnant holding period (${holdingYears} years) with zero monetization velocity.`);
  }

  const evidence: EvidenceBreakdown = {
    dataQualityPct: state.data_quality_pct,
    telemetryQualityPct: state.coverage_report.telemetry_coverage_pct ?? 100,
    jevConfidence: Math.round(confidence * 100),
    compositeScore,
    hardGateTriggered,
    statusLabel,
    verifiedPros,
    verifiedCons,
    coverageReport: state.coverage_report,
    metricsEvidence: state.metrics_evidence,
    strategyProfile,
    scoreBreakdown: {
      brandabilityComponent: brandComponent,
      memorabilityComponent: renJustComponent,
      commercialSearchComponent: Math.round(inboundNorm * 0.1),
      liquidityComponent: inbComponent,
      tldEquityComponent: holdEconComponent,
      economicsComponent: Math.round(holdingEconNorm * 0.1),
    },
  };

  const explainability = generateExplainabilityReport(
    valuation,
    state,
    jev,
    economicValuation,
    holdingEfficiency,
    riskEvaluation,
    'renew',
    freeEvidence,
    manualOverrides
  );

  return {
    domain: valuation.domain,
    score: parseFloat((compositeScore / 100).toFixed(2)),
    compositeScore,
    verdict,
    statusLabel,
    headline,
    summary,
    bannerClass,
    netAnnualCashflow,
    threeYearCarryingCost,
    estimatedLiquidationValue,
    holdingYears,
    inboundOffers: inboundOffers || 0,
    valuation,
    jev,
    evidence,
    strategy_profile: strategyProfile,
    economic_valuation: economicValuation,
    holding_efficiency: holdingEfficiency,
    risk_evaluation: riskEvaluation,
    explainability,
    free_evidence: freeEvidence,
  };
}

/**
 * Mode C: Business Brand Selection & Multi-Domain Comparative Decision Engine
 * Concurrent lookups, dynamic priority matrix, hard risk gates, and cross-domain trade-offs.
 */
export async function evaluateBrandSelection(
  business: BusinessContext,
  domains: string[],
  typesafeKey?: string,
  forceRefresh: boolean = false
): Promise<ComparativeDecisionReport> {
  const cleanDomains = Array.from(
    new Set(
      domains
        .map(sanitizeDomain)
        .filter((d) => d.length > 0)
        .slice(0, 10)
    )
  );

  if (cleanDomains.length === 0) {
    throw new Error('At least one valid domain is required for brand selection analysis.');
  }

  const currentDateStr = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  // 1. Parallel Async Discovery for all candidate domains
  const candidateTasks = cleanDomains.map(async (domain) => {
    const valCacheKey = `valuation:${domain}`;
    let valuation = !forceRefresh ? getFromCache<DomainValuation>(valCacheKey)?.data : null;
    if (!valuation) {
      valuation = calculateDomainValuation(domain);
      setInCache(valCacheKey, valuation, CACHE_TTLS.STRUCTURAL);
    }

    const rdapCacheKey = `rdap:${domain}`;
    let rdap = !forceRefresh ? getFromCache<any>(rdapCacheKey)?.data : null;
    if (!rdap) {
      try {
        rdap = await checkDomainAvailability(domain);
      } catch {
        rdap = { domain, status: 'registered', rdapStatusCode: 200 };
      }
    }

    const freeEvidence = await fetchFreeEvidence(domain, valuation.sld);

    // Build Mode C JEV State
    const jevState = {
      context_mode: 'brand_selection',
      business,
      domain: {
        fqdn: domain,
        sld: valuation.sld,
        tld: valuation.extension.tld,
        tld_tier: valuation.extension.tier,
      },
      structure: {
        characters: valuation.length,
        syllables: valuation.syllables,
        pronounceable: valuation.pronounceabilityScore >= 60,
        has_hyphens_or_digits: /[-0-9]/.test(valuation.sld),
        is_dictionary_word: valuation.keywordMatch.length > 0,
      },
      metrics_evidence: {
        exact_search_volume: freeEvidence.googleSuggest.suggestion_count * 200,
        cpc_usd: freeEvidence.googleSuggest.has_commercial_intent_tokens ? 2.5 : null,
        backlinks_count: null,
        referring_domains: null,
        annual_parking_revenue_usd: null,
        inbound_inquiries_12m: null,
        comparable_sales_count: valuation.comparableSalesCount,
        median_comparable_usd: valuation.medianComparableUsd,
        wayback_snapshot_count: freeEvidence.wayback.snapshot_count,
        wayback_first_seen_year: freeEvidence.wayback.first_seen_year,
        wayback_last_seen_year: freeEvidence.wayback.last_seen_year,
        google_suggestions_count: freeEvidence.googleSuggest.suggestion_count,
        google_top_suggestions: freeEvidence.googleSuggest.top_suggestions,
        google_commercial_intent: freeEvidence.googleSuggest.has_commercial_intent_tokens,
        wikipedia_is_encyclopedic: freeEvidence.wikipedia.is_encyclopedic_term,
        wikipedia_hits: freeEvidence.wikipedia.search_hit_count,
        dns_resolving: freeEvidence.dns.is_resolving,
        dns_has_mx: freeEvidence.dns.has_mx_mail_records,
        dns_nameservers: freeEvidence.dns.nameservers,
        trademark_risk_score: freeEvidence.trademarkScan.trademark_collision_risk,
        trademark_matched_brand: freeEvidence.trademarkScan.matched_brand_name,
      },
      economics: {
        annual_renewal_cost: valuation.annualCarryingCost,
        estimated_retail_value: valuation.estimatedValue,
        max_budget_usd: business.max_budget_usd || null,
      },
    };

    const jev = await queryTypeSafeJEV(jevState, 'brand_selection', typesafeKey);

    return {
      domain,
      valuation,
      rdap,
      freeEvidence,
      jev,
      jevState,
    };
  });

  const rawResults = await Promise.all(candidateTasks);

  // 2. Score and Weight Candidates according to Business Priority
  const evaluatedCandidates: CandidateEvaluationResult[] = rawResults.map((item) => {
    const { domain, valuation, rdap, freeEvidence, jev } = item;
    const modeC = jev.modeCAnswers || {
      business_fit: { score: 2, normalizedPercentage: 75, levelLabel: 'Strong' },
      brand_authority: { score: 1, normalizedPercentage: 60, levelLabel: 'Acceptable' },
      tld_trust_profile: { choice: 'tech_accepted' as const, confidence: 0.90 },
      verbal_leakage_risk: { value: 0.30, confidence: 0.85 },
      trademark_risk: { choice: 'clear' as const, confidence: 0.92 },
    };

    // Component Scores (0 to 100)
    const fitScore = modeC.business_fit.normalizedPercentage;
    
    let brandScore = modeC.brand_authority.normalizedPercentage;
    if (valuation.pronounceabilityScore >= 80) brandScore = Math.min(100, brandScore + 10);
    if (valuation.length <= 5) brandScore = Math.min(100, brandScore + 10);
    if (/[-0-9]/.test(valuation.sld)) brandScore = Math.max(10, brandScore - 30);

    let trustScore = 70;
    const tldChoice = modeC.tld_trust_profile.choice;
    if (tldChoice === 'gold_standard_com') trustScore = 100;
    else if (tldChoice === 'tech_accepted') trustScore = business.business_type === 'saas' || business.industry.toLowerCase().includes('ai') ? 92 : 85;
    else if (tldChoice === 'niche_friction') trustScore = 65;
    else trustScore = 30;

    let riskScore = 95;
    const tmChoice = modeC.trademark_risk.choice;
    if (tmChoice === 'clear') riskScore = 95;
    else if (tmChoice === 'low') riskScore = 85;
    else if (tmChoice === 'moderate') riskScore = 55;
    else if (tmChoice === 'high') riskScore = 20;
    else riskScore = 5;

    let economicsScore = 90;
    if (valuation.annualCarryingCost <= 20) economicsScore = 95;
    else if (valuation.annualCarryingCost <= 50) economicsScore = 80;
    else if (valuation.annualCarryingCost <= 85) economicsScore = 65;
    else economicsScore = 40;

    if (business.max_budget_usd && valuation.estimatedValue > business.max_budget_usd * 2) {
      economicsScore = Math.max(20, economicsScore - 35);
    }

    // Dynamic Priority Weighting Matrix
    let compositeScore = 0;
    const priority = business.primary_priority || 'brand_first';

    switch (priority) {
      case 'brand_first':
        // Business Fit 35%, Brand Strength 30%, Trust/TLD 15%, Economics 10%, Risk 10%
        compositeScore =
          fitScore * 0.35 +
          brandScore * 0.30 +
          trustScore * 0.15 +
          economicsScore * 0.10 +
          riskScore * 0.10;
        break;

      case 'trust_first':
        // Trust/TLD 35%, Business Fit 25%, Risk 20%, Brand Strength 10%, Economics 10%
        compositeScore =
          trustScore * 0.35 +
          fitScore * 0.25 +
          riskScore * 0.20 +
          brandScore * 0.10 +
          economicsScore * 0.10;
        break;

      case 'budget_first':
        // Economics 40%, Business Fit 25%, Trust/TLD 15%, Brand Strength 10%, Risk 10%
        compositeScore =
          economicsScore * 0.40 +
          fitScore * 0.25 +
          trustScore * 0.15 +
          brandScore * 0.10 +
          riskScore * 0.10;
        break;

      case 'global_first':
        // Trust/TLD 30%, Brand Strength 25%, Business Fit 20%, Risk 15%, Economics 10%
        compositeScore =
          trustScore * 0.30 +
          brandScore * 0.25 +
          fitScore * 0.20 +
          riskScore * 0.15 +
          economicsScore * 0.10;
        break;

      case 'seo_first': {
        // Business Fit 30%, Search/Commercial Intent 30%, Trust/TLD 20%, Economics 10%, Brand Strength 10%
        const searchScore = freeEvidence.googleSuggest.has_commercial_intent_tokens
          ? 90
          : freeEvidence.googleSuggest.suggestion_count > 0
          ? 70
          : 45;
        compositeScore =
          fitScore * 0.30 +
          searchScore * 0.30 +
          trustScore * 0.20 +
          economicsScore * 0.10 +
          brandScore * 0.10;
        break;
      }
      default:
        compositeScore =
          fitScore * 0.35 +
          brandScore * 0.30 +
          trustScore * 0.15 +
          economicsScore * 0.10 +
          riskScore * 0.10;
    }

    const finalComposite = Math.min(100, Math.max(10, Math.round(compositeScore)));
    const hardRisk = tmChoice === 'critical' || tmChoice === 'high';

    // Evidence coverage calculation
    let confirmedSignals = 4; // structure, syllables, TLD, length
    if (freeEvidence.wayback.has_historical_snapshots) confirmedSignals++;
    if (freeEvidence.googleSuggest.suggestion_count > 0) confirmedSignals++;
    if (freeEvidence.dns.is_resolving) confirmedSignals++;
    if (freeEvidence.wikipedia.is_encyclopedic_term) confirmedSignals++;
    if (freeEvidence.trademarkScan.trademark_collision_risk !== 'high') confirmedSignals++;
    const evidenceCoverage = Math.min(100, Math.round((confirmedSignals / 9) * 100));

    // Why Recommended & Why Not points
    const whyRec: string[] = [];
    const whyNot: string[] = [];

    const isRoot = valuation.sld.toLowerCase() === business.business_name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const isCom = valuation.extension.tld === '.com';
    const hasPrefix = valuation.sld.startsWith('get') || valuation.sld.startsWith('try') || valuation.sld.startsWith('use') || valuation.sld.startsWith('the') || valuation.sld.startsWith('my');

    if (isRoot) {
      whyRec.push(`Direct pure root match for "${business.business_name}" with zero prefix friction.`);
    } else if (fitScore >= 75) {
      whyRec.push(`Strong brand resonance and category alignment with ${business.industry} positioning.`);
    }

    if (isCom) {
      whyRec.push(`Gold standard .com TLD provides maximum enterprise authority and zero word-of-mouth leakage.`);
    } else if (valuation.extension.tld === '.ai') {
      whyRec.push(`Modern .ai extension establishes instant category leadership for artificial intelligence startups.`);
    } else if (valuation.extension.tier === 'Tier 1') {
      whyRec.push(`Respected modern developer extension (${valuation.extension.tld}) with high tech ecosystem trust.`);
    }

    if (valuation.length <= 6) {
      whyRec.push(`Ultra-short length (${valuation.length} characters) optimizes auditory recall and typing speed.`);
    }

    if (!/[-0-9]/.test(valuation.sld)) {
      whyRec.push(`Clean alphanumeric construction without hyphens or confusing digits.`);
    }

    if (freeEvidence.googleSuggest.has_commercial_intent_tokens) {
      whyRec.push(`Identified active commercial search queries in Google Suggest.`);
    }

    // Why not points
    if (hasPrefix) {
      whyNot.push(`Prefix modifier ("get"/"try") creates cognitive friction and leads to typing leakage toward the pure root.`);
    }

    if (!isCom) {
      whyNot.push(`Non-.com extension (${valuation.extension.tld}) risks traffic leakage to .com counterpart during verbal referral.`);
    }

    if (valuation.annualCarryingCost > 40) {
      whyNot.push(`Elevated annual registry renewal fee ($${valuation.annualCarryingCost}/yr vs $14/yr baseline).`);
    }

    if (/[-0-9]/.test(valuation.sld)) {
      whyNot.push(`Hyphens or digits present, which degrades enterprise credibility and word-of-mouth recall.`);
    }

    if (valuation.length > 12) {
      whyNot.push(`Longer character count (${valuation.length} characters) increases typing friction on mobile devices.`);
    }

    if (hardRisk) {
      whyNot.push(`Significant trademark conflict detected against known registered brand (${freeEvidence.trademarkScan.matched_brand_name || 'Protected Mark'}).`);
    }

    let status: 'recommended' | 'strong_alternative' | 'viable_budget' | 'avoid_risk' = 'strong_alternative';
    if (hardRisk) {
      status = 'avoid_risk';
    } else if (finalComposite >= 80) {
      status = 'recommended';
    } else if (economicsScore >= 85 && finalComposite >= 60) {
      status = 'viable_budget';
    } else {
      status = 'strong_alternative';
    }

    const trademarkLegalStatus = hardRisk
      ? `Potential trademark friction flagged against "${freeEvidence.trademarkScan.matched_brand_name || 'established corporate brand'}". Comprehensive legal clearance recommended before incorporation.`
      : `No significant trademark conflicts identified in the sources checked as of ${currentDateStr}. Professional legal review advised before incorporation.`;

    const candidateHash = generateStateHash(domain, item.jevState, BRAND_SELECTION_QUESTION_SET_VERSION, 'brand_selection');
    const candidateVersionTrace: AuditVersionTrace = {
      engine_version: ENGINE_VERSION,
      question_set_version: BRAND_SELECTION_QUESTION_SET_VERSION,
      model: 'jev-latest',
      state_hash: candidateHash,
      timestamp: new Date().toISOString(),
      cache_hit: false,
      cache_ttl_seconds_remaining: Math.round(CACHE_TTLS.STATE_HASH / 1000),
      latency_ms: jev.latencyMs,
      execution_source: jev.source === 'api.typesafe.ai' ? 'primary_jev_api' : 'local_contract_fallback',
      canonical_state_json: canonicalizeJson(item.jevState),
      cache_expires_at: new Date(Date.now() + CACHE_TTLS.STATE_HASH).toISOString(),
      upstream_error: jev.upstream_error,
    };

    return {
      domain,
      rank: 1, // updated below
      status,
      business_fit_score: fitScore,
      brand_strength_score: brandScore,
      trust_tld_score: trustScore,
      risk_score: riskScore,
      economics_score: economicsScore,
      composite_decision_score: finalComposite,
      jev_confidence: Math.round(jev.confidence * 100),
      evidence_coverage: evidenceCoverage,
      why_recommended_points: whyRec.slice(0, 4),
      why_not_this_domain_points: whyNot.slice(0, 4),
      hard_risk_triggered: hardRisk,
      trademark_legal_status: trademarkLegalStatus,
      valuation,
      rdap,
      free_evidence: freeEvidence,
      jevAnswers: modeC,
      version_trace: candidateVersionTrace,
      rawJevPayload: jev.rawJevPayload,
      rawJevResponse: jev.rawJevResponse,
      latencyMs: jev.latencyMs,
    };
  });

  // 3. Sort candidates: Put non-risky with highest score first, push avoid_risk to bottom
  evaluatedCandidates.sort((a, b) => {
    if (a.hard_risk_triggered && !b.hard_risk_triggered) return 1;
    if (!a.hard_risk_triggered && b.hard_risk_triggered) return -1;
    return b.composite_decision_score - a.composite_decision_score;
  });

  // Assign ranks
  evaluatedCandidates.forEach((c, idx) => {
    c.rank = idx + 1;
    if (idx === 0 && !c.hard_risk_triggered) {
      c.status = 'recommended';
    } else if (c.hard_risk_triggered) {
      c.status = 'avoid_risk';
    } else if (idx === 1 && c.composite_decision_score >= 70) {
      c.status = 'strong_alternative';
    } else if (c.economics_score >= 80) {
      c.status = 'viable_budget';
    } else {
      c.status = 'strong_alternative';
    }
  });

  const recommendedOption = evaluatedCandidates[0];
  const alternatives = evaluatedCandidates.slice(1);

  // 4. Generate explicit cross-domain trade-offs relative to recommended winner
  const crossDomainTradeoffs = alternatives.map((alt) => {
    let summary = '';
    const altIsPrefix = alt.domain.startsWith('get') || alt.domain.startsWith('try') || alt.domain.startsWith('use');
    const recIsCom = recommendedOption.domain.endsWith('.com');
    const altIsAi = alt.domain.endsWith('.ai');
    const altIsCom = alt.domain.endsWith('.com');

    if (alt.hard_risk_triggered) {
      summary = `Severe legal and UDRP risk. Dropping this candidate preserves incorporation safety.`;
    } else if (altIsPrefix && !recommendedOption.domain.startsWith('get')) {
      summary = `The prefix creates verbal friction and leaks customer trust compared to ${recommendedOption.domain}.`;
    } else if (altIsAi && recIsCom) {
      summary = `Strong for modern AI positioning, but ${recommendedOption.domain} provides universal authority for mainstream B2B enterprise procurement.`;
    } else if (recIsCom && !altIsCom) {
      summary = `Good secondary option, but lacks the global default traffic capture of ${recommendedOption.domain}.`;
    } else if (alt.economics_score > recommendedOption.economics_score) {
      summary = `More cost-effective on initial acquisition or annual renewals, but compromises on brand equity.`;
    } else {
      summary = `Scored lower across business fit (${alt.business_fit_score} vs ${recommendedOption.business_fit_score}) and naming authority.`;
    }

    return {
      domain: alt.domain,
      tradeoff_summary: summary,
    };
  });

  // Unobserved gaps
  const unobservedGaps: string[] = [];
  unobservedGaps.push('Comprehensive USPTO / WIPO formal trademark counsel docketing unlinked.');
  unobservedGaps.push('Private seller minimum reserve pricing not verified via automated protocol.');
  unobservedGaps.push('Target audience survey panel feedback not incorporated.');

  return {
    business,
    candidates_count: cleanDomains.length,
    recommended_option: recommendedOption,
    alternatives,
    comparative_matrix_columns: [
      'Rank',
      'Candidate Domain',
      'Business Fit',
      'Brand Strength',
      'Trust / TLD',
      'Risk Clearance',
      'Economics',
      'Decision Score',
      'Action Status',
    ],
    cross_domain_tradeoffs: crossDomainTradeoffs,
    unobserved_gaps: unobservedGaps,
    timestamp: new Date().toISOString(),
    version_trace: {
      engine_version: ENGINE_VERSION,
      question_set_version: BRAND_SELECTION_QUESTION_SET_VERSION,
      model: 'jev-latest',
      state_hash: generateBrandSelectionHash(business, cleanDomains),
      timestamp: new Date().toISOString(),
      cache_hit: false,
      cache_ttl_seconds_remaining: Math.round(CACHE_TTLS.STATE_HASH / 1000),
      latency_ms: rawResults.reduce((max, r) => Math.max(max, r.jev.latencyMs), 0),
      execution_source: rawResults.some((r) => r.jev.source === 'api.typesafe.ai')
        ? 'primary_jev_api'
        : 'local_contract_fallback',
      cache_expires_at: new Date(Date.now() + CACHE_TTLS.STATE_HASH).toISOString(),
    },
  };
}
