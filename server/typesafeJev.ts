import dotenv from 'dotenv';
import crypto from 'crypto';
dotenv.config();

export const ENGINE_VERSION = '2.4.0';
export const ACQUISITION_QUESTION_SET_VERSION = 'acquisition-v2.1';
export const RENEWAL_QUESTION_SET_VERSION = 'renewal-v2.1';
export const BRAND_SELECTION_QUESTION_SET_VERSION = 'brand-selection-v1.0';

/**
 * Deterministic JSON canonicalization with recursively sorted keys
 */
export function canonicalizeJson(obj: any): string {
  if (obj === null || obj === undefined || typeof obj !== 'object') {
    return JSON.stringify(obj);
  }
  if (Array.isArray(obj)) {
    return '[' + obj.map((item) => canonicalizeJson(item)).join(',') + ']';
  }
  const keys = Object.keys(obj)
    .filter((key) => obj[key] !== undefined)
    .sort();
  const pairs = keys.map((key) => {
    return JSON.stringify(key) + ':' + canonicalizeJson(obj[key]);
  });
  return '{' + pairs.join(',') + '}';
}

/**
 * Generates a deterministic 64-character SHA-256 state hash for audit caching
 */
export function generateStateHash(
  domain: string,
  state: any,
  questionSetVersion: string,
  mode: string
): string {
  const normalizedMode = mode.toLowerCase().trim();
  const canonicalPayload = canonicalizeJson({
    audit_mode: normalizedMode,
    domain: domain.toLowerCase().trim(),
    mode: normalizedMode,
    questionSetVersion,
    state,
  });
  return crypto.createHash('sha256').update(canonicalPayload).digest('hex');
}

export interface MetricSourceTag {
  value: number | string | boolean | null;
  source: string;
  source_label: string;
  is_verified: boolean;
}

export interface DomainMetricsEvidence {
  exact_search_volume: number | null;
  cpc_usd: number | null;
  backlinks_count: number | null;
  referring_domains: number | null;
  annual_parking_revenue_usd: number | null;
  inbound_inquiries_12m: number | null;
  comparable_sales_count: number | null;
  median_comparable_usd: number | null;
  // Free evidence enrichments
  wayback_snapshot_count?: number;
  wayback_first_seen_year?: number | null;
  wayback_last_seen_year?: number | null;
  google_suggestions_count?: number;
  google_top_suggestions?: string[];
  google_commercial_intent?: boolean;
  wikipedia_is_encyclopedic?: boolean;
  wikipedia_hits?: number;
  dns_resolving?: boolean;
  dns_has_mx?: boolean;
  dns_nameservers?: string[];
  trademark_risk_score?: 'clear' | 'low' | 'high';
  trademark_matched_brand?: string | null;
  // Granular source tags
  sources?: Record<string, MetricSourceTag>;
}

export interface EvidenceCoverageReport {
  coverage_pct: number; // 0 to 100
  verified_fields: string[];
  unknown_fields: string[];
  free_signals_count?: number;
  manual_overrides_count?: number;
}

export interface DomainState {
  domain: {
    fqdn: string;
    sld: string;
    tld: string;
    tld_tier: string;
  };
  structure: {
    characters: number;
    syllables: number;
    pronounceable: boolean;
    has_hyphens_or_digits: boolean;
    is_dictionary_word: boolean;
  };
  metrics_evidence: DomainMetricsEvidence;
  economics: {
    asking_or_backorder_price?: number;
    annual_renewal_cost: number;
  };
  context_mode?: 'buy' | 'renewal';
  holding_years?: number | null;
  data_quality_pct: number; // Percentage of non-null verifiable metrics
  coverage_report: EvidenceCoverageReport;
}

export type JEVSystemOneState = DomainState;

export interface JEVChoiceAnswer<T = string> {
  choice: T;
  confidence: number;
  probabilities?: Record<string, number>;
}

export interface JEVNoulAnswer {
  value: number; // 0.0 to 1.0
  confidence: number;
}

export interface JEVScoreAnswer {
  score: number; // 0 to 4
  confidence: number;
  normalizedPercentage: number; // 0 to 100%
  levelLabel: string;
}

export type DomainStrategyType =
  | 'brandable'
  | 'exact_match_keyword'
  | 'geo_service'
  | 'short_acronym_numeric'
  | 'tech_trend';

export interface StrategyWeights {
  brandability: number;
  memorability: number;
  commercial_search: number;
  liquidity: number;
  tld_equity: number;
  economics_spread: number;
}

export interface StrategyProfileResult {
  strategy_type: DomainStrategyType;
  label: string;
  description: string;
  applied_weights: StrategyWeights;
}

export interface ModeAJevAnswers {
  brandability: JEVScoreAnswer;
  startup_memorability: JEVNoulAnswer;
  trademark_risk: JEVChoiceAnswer<'clear' | 'low' | 'moderate' | 'high' | 'critical'>;
  aftermarket_liquidity: JEVChoiceAnswer<'high_liquidity' | 'slow_speculative' | 'illiquid'>;
  speculative_drag: JEVNoulAnswer;
  domain_strategy_type?: JEVChoiceAnswer<DomainStrategyType>;
}

export interface ModeBJevAnswers {
  renewal_justification: JEVChoiceAnswer<'essential_hold' | 'borderline_review' | 'drop_candidate'>;
  inbound_monetization_appeal: JEVNoulAnswer;
  trademark_risk: JEVChoiceAnswer<'clear' | 'low' | 'moderate' | 'high' | 'critical'>;
  brandability: JEVScoreAnswer;
  domain_strategy_type?: JEVChoiceAnswer<DomainStrategyType>;
}

export interface ModeCJevAnswers {
  business_fit: JEVScoreAnswer;
  brand_authority: JEVScoreAnswer;
  tld_trust_profile: JEVChoiceAnswer<'gold_standard_com' | 'tech_accepted' | 'niche_friction' | 'risky_spam'>;
  verbal_leakage_risk: JEVNoulAnswer;
  trademark_risk: JEVChoiceAnswer<'clear' | 'low' | 'moderate' | 'high' | 'critical'>;
  domain_strategy_type?: JEVChoiceAnswer<DomainStrategyType>;
}

export interface JEVResponse {
  model: 'jev-latest' | string;
  source: 'api.typesafe.ai' | 'jev-engine-fallback';
  latencyMs: number;
  missingApiKey: boolean;
  mode: 'buy' | 'renew' | 'brand_selection' | 'renewal';
  confidence: number; // Statistical certainty of atomic predictions (0.00 to 1.00)
  rawJevPayload: {
    model: string;
    state: DomainState | Record<string, any>;
    questions: Record<string, any>;
  };
  rawJevResponse: Record<string, any>;
  modeAAnswers?: ModeAJevAnswers;
  modeBAnswers?: ModeBJevAnswers;
  modeCAnswers?: ModeCJevAnswers;
  answers: Record<string, any>;
  trademark_risk_flagged: boolean;
  trademark_override_applied: boolean;
  upstream_error?: {
    status: number;
    message: string;
    reason: string;
  };
}

const NULL_SAFETY_PREFIX =
  'NULL SAFETY RULE: Fields with null values indicate unobserved or unavailable data. UNKNOWN is strictly distinct from FALSE or 0. Do NOT infer, penalize, or assume favorable scenarios for null fields. Base all scores strictly on confirmed evidence.\n\n';

export const JEV_STRATEGY_QUESTION = {
  type: 'choice',
  instructions:
    NULL_SAFETY_PREFIX +
    'Classify the primary commercial investment archetype of this domain based on its linguistic and structural anatomy.',
  criteria: {
    brandable: 'Invented, modern phonetic startup name with high trademark distinctiveness (e.g., Xavo, Insulyx).',
    exact_match_keyword: 'Standard dictionary word or commercial product keyword phrase (e.g., CloudStorage, CarLoans).',
    geo_service: 'Geographic location combined with a local trade or service (e.g., MiamiPlumber, CasaCourier).',
    short_acronym_numeric: 'Ultra-short 2 to 4 character acronym, letter combination, or numeric domain.',
    tech_trend: 'Emerging technology terminology or trending industry suffix (e.g., HyperAgent, NeuralFlow).'
  },
};

/**
 * Mode A: Acquisition Atomic Questions
 */
export const JEV_MODE_A_QUESTIONS = {
  domain_strategy_type: JEV_STRATEGY_QUESTION,
  brandability: {
    type: 'score',
    instructions:
      NULL_SAFETY_PREFIX +
      'Rate the commercial brandability, syllabic crispness, and enterprise naming power of this domain based strictly on confirmed structural evidence.',
    levels: [
      'Unusable: Highly obscure, awkward phonetic flow, meaningless numbers or hyphens.',
      'Weak: Clunky or elongated, low enterprise or consumer recall.',
      'Average: Clear generic or descriptive phrase, decent clarity.',
      'Strong: Crisp, memorable, intuitive brand potential.',
      'Premium: Ultra-short, category-defining authority, elite memorability.'
    ],
  },
  startup_memorability: {
    type: 'noul',
    instructions:
      NULL_SAFETY_PREFIX +
      'Is this name punchy, distinctive, and viable as a modern high-growth startup or tech identity?',
  },
  trademark_risk: {
    type: 'choice',
    instructions:
      NULL_SAFETY_PREFIX +
      'Evaluate trademark conflict exposure against global registered trademarks and corporate brand names.',
    criteria: {
      clear: 'No identifiable trademark collisions or brand confusion.',
      low: 'Generic dictionary word with no single entity claiming exclusive commercial monopoly.',
      moderate: 'Partial phonetic or partial keyword overlap with an existing commercial brand.',
      high: 'Close similarity or partial match with a famous multinational trademark.',
      critical: 'Exact match or blatant bad-faith typosquatting on a well-known protected trademark.'
    },
  },
  aftermarket_liquidity: {
    type: 'choice',
    instructions:
      NULL_SAFETY_PREFIX +
      'Determine the probability and speed of resale in aftermarket domain brokerages and investor auctions based only on verified metrics.',
    criteria: {
      high_liquidity: 'Sought-after keyword or short brandable in Tier 1 TLD with proven buyer velocity.',
      slow_speculative: 'Niche appeal requiring patient holding and targeted outbound marketing.',
      illiquid: 'High carrying cost drag with near-zero aftermarket secondary buyer demand.'
    },
  },
  speculative_drag: {
    type: 'noul',
    instructions:
      NULL_SAFETY_PREFIX +
      'Is acquiring this domain purely speculative without proven organic demand signals or commercial utility?',
  },
};

/**
 * Mode B: Renewal Atomic Questions
 */
export const JEV_MODE_B_QUESTIONS = {
  domain_strategy_type: JEV_STRATEGY_QUESTION,
  renewal_justification: {
    type: 'choice',
    instructions:
      NULL_SAFETY_PREFIX +
      'Determine whether holding this domain another year justifies registry renewal fees versus dropping.',
    criteria: {
      essential_hold: 'High intrinsic equity, monetization yield, or imminent inbound sale probability justifies renewal.',
      borderline_review: 'Marginal ROI; consider grace-period auction or price reduction before letting drop.',
      drop_candidate: 'Sunk cost. Carrying drag exceeds expected residual value; drop on expiry.'
    },
  },
  inbound_monetization_appeal: {
    type: 'noul',
    instructions:
      NULL_SAFETY_PREFIX +
      'Does this asset demonstrate sufficient residual appeal to attract lease, parking, or inbound buy offers?',
  },
  trademark_risk: {
    type: 'choice',
    instructions:
      NULL_SAFETY_PREFIX +
      'Evaluate trademark conflict exposure against global registered trademarks.',
    criteria: {
      clear: 'No identifiable trademark collisions.',
      low: 'Generic term with no exclusive brand collision.',
      moderate: 'Partial commercial overlap with existing brands.',
      high: 'Significant risk of UDRP dispute or legal challenge.',
      critical: 'High-hazard trademark violation; continuing renewal creates legal liability.'
    },
  },
  brandability: {
    type: 'score',
    instructions:
      NULL_SAFETY_PREFIX +
      'Rate the long-term commercial brandability and portfolio retention value.',
    levels: [
      'Unusable: No commercial retention value.',
      'Weak: Low brandability and low resale interest.',
      'Average: Viable long-tail domain.',
      'Strong: High brand equity.',
      'Premium: Crown jewel asset.'
    ],
  },
};

/**
 * Mode C: Business Brand Selection & Multi-Domain Comparative Decision Questions
 */
export const JEV_MODE_C_QUESTIONS = {
  business_fit: {
    type: 'score',
    instructions:
      NULL_SAFETY_PREFIX +
      'Rate the naming naturalness, positioning match, and category authority of this domain specifically for state.business.',
    levels: [
      'Mismatched: Irrelevant or confusing naming disconnect with the business vertical.',
      'Marginal: Passable secondary fit, but lacks punch or category alignment.',
      'Strong: Intuitive positioning, credible identity, and natural industry resonance.',
      'Category Defining: Elite, authoritative, and perfectly defines the product category.'
    ],
  },
  brand_authority: {
    type: 'score',
    instructions:
      NULL_SAFETY_PREFIX +
      'Rate phonetic memorability, pronunciation fluidity, and startup credibility.',
    levels: [
      'Weak: High syllabic friction, awkward spelling, or weak credibility.',
      'Acceptable: Solid, easy to spell, reasonable startup credibility.',
      'High Brand Equity: Exceptional word-of-mouth fluidity, memorable, and premium stature.'
    ],
  },
  tld_trust_profile: {
    type: 'choice',
    instructions:
      NULL_SAFETY_PREFIX +
      'Evaluate audience trust for this TLD within state.business.target_market.',
    criteria: {
      gold_standard_com: 'Universal authority and zero cognitive friction (.com).',
      tech_accepted: 'Established credibility in developer, AI, tech, and modern startup ecosystems (.ai, .io, .dev).',
      niche_friction: 'Specialized or country-specific TLD with potential international leakage (.co, .app, .org, ccTLD).',
      risky_spam: 'Low trust, budget, or spam-associated TLD tier with severe conversion friction.'
    },
  },
  verbal_leakage_risk: {
    type: 'noul',
    instructions:
      NULL_SAFETY_PREFIX +
      'Does this domain risk typing leakage or auditory spelling confusion during word-of-mouth referral?',
  },
  trademark_risk: {
    type: 'choice',
    instructions:
      NULL_SAFETY_PREFIX +
      'Evaluate trademark conflict exposure against global registered trademarks.',
    criteria: {
      clear: 'No identifiable trademark collisions.',
      low: 'Generic term with no exclusive commercial monopoly.',
      moderate: 'Partial commercial overlap with existing brands.',
      high: 'Significant risk of UDRP dispute or legal challenge.',
      critical: 'High-hazard trademark violation; hazardous legal liability.'
    },
  },
};

const KNOWN_TRADEMARKS = [
  'google', 'apple', 'amazon', 'meta', 'facebook', 'microsoft', 'netflix', 'twitter',
  'instagram', 'tiktok', 'uber', 'airbnb', 'paypal', 'shopify', 'stripe', 'aliexpress',
  'tesla', 'samsung', 'nike', 'adidas', 'coca', 'pepsi'
];

const GEO_TOKENS = [
  'ny', 'nyc', 'la', 'sf', 'miami', 'paris', 'london', 'tokyo', 'casa', 'dubai', 'berlin',
  'boston', 'chicago', 'austin', 'seattle', 'toronto', 'sydney', 'uk', 'us', 'fr', 'ma',
  'de', 'cali', 'texas', 'florida', 'york', 'vegas', 'rome', 'madrid'
];

const LOCAL_SERVICE_TOKENS = [
  'plumber', 'courier', 'electrician', 'roofing', 'lawyer', 'dental', 'clinic', 'movers',
  'tours', 'hotel', 'restaurant', 'cleaners', 'repair', 'towing', 'hvac', 'realty',
  'broker', 'storage', 'autos', 'cars', 'locksmith', 'contractor', 'dentist'
];

const TECH_TREND_TOKENS = [
  'ai', 'bot', 'agent', 'chain', 'meta', 'flow', 'hyper', 'neural', 'synth', 'quantum',
  'dao', 'labs', 'dev', 'data', 'cloud', 'cyber', 'gpt', 'token', 'crypto', 'node',
  'stack', 'mesh', 'sync', 'scale', 'pulse', 'vector', 'compute', 'vision', 'mind'
];

const COMMERCIAL_KEYWORD_TOKENS = [
  'pay', 'bank', 'shop', 'store', 'market', 'trade', 'loan', 'insurance', 'credit',
  'health', 'travel', 'deals', 'wave', 'quick', 'free', 'downloads', 'food', 'news',
  'home', 'energy', 'care', 'cash', 'money', 'invest', 'secure', 'direct', 'speed'
];

/**
 * Deterministic Strategy Pre-Classification
 */
export function classifyDomainStrategy(state: DomainState): DomainStrategyType {
  const sld = state.domain.sld.toLowerCase();
  const tld = state.domain.tld.toLowerCase();

  // 1. Short Acronym or Numeric (<= 4 chars)
  if (state.structure.characters <= 4 && /^[a-z0-9]+$/i.test(sld)) {
    return 'short_acronym_numeric';
  }

  // 2. Geo Local Service
  const hasGeoToken = GEO_TOKENS.some((geo) => sld.startsWith(geo) || sld.endsWith(geo) || sld.includes(geo));
  const hasServiceToken = LOCAL_SERVICE_TOKENS.some((srv) => sld.includes(srv));
  const hasHyphenLocal = state.structure.has_hyphens_or_digits && (hasGeoToken || hasServiceToken);
  if ((hasGeoToken && hasServiceToken) || hasHyphenLocal || (hasServiceToken && (tld === '.ma' || tld === '.fr' || tld === '.uk' || tld === '.de' || tld === '.ca' || tld === '.es'))) {
    return 'geo_service';
  }

  // 3. Tech Trend / Emerging
  const hasTechToken = TECH_TREND_TOKENS.some((tech) => sld.startsWith(tech) || sld.endsWith(tech) || sld.includes(tech));
  if (hasTechToken && (tld === '.ai' || tld === '.io' || tld === '.dev' || tld === '.app' || tld === '.tech' || sld.includes('agent') || sld.includes('neural') || sld.includes('hyper') || sld.includes('gpt') || sld.includes('quantum'))) {
    return 'tech_trend';
  }

  // 4. Exact Match Keyword
  const hasCommercialWord = COMMERCIAL_KEYWORD_TOKENS.some((kw) => sld.includes(kw));
  if ((hasCommercialWord || state.structure.is_dictionary_word) && ((state.metrics_evidence.exact_search_volume !== null && state.metrics_evidence.exact_search_volume > 1000) || sld.includes('shop') || sld.includes('deals') || sld.includes('downloads') || sld.includes('loans') || sld.includes('storage') || sld.includes('cloud') || sld.includes('free'))) {
    return 'exact_match_keyword';
  }

  // Fallback check for tech words
  if (hasTechToken) {
    return 'tech_trend';
  }

  // Fallback check for commercial words
  if (hasCommercialWord || state.structure.is_dictionary_word) {
    return 'exact_match_keyword';
  }

  // 5. Default: Brandable Startup
  return 'brandable';
}

/**
 * Returns the Strategy Profile & Dynamic Weights corresponding to the archetype
 */
export function getStrategyProfile(strategyType: DomainStrategyType): StrategyProfileResult {
  switch (strategyType) {
    case 'brandable':
      return {
        strategy_type: 'brandable',
        label: 'Brandable Startup',
        description: 'Invented or coined phonetic name with high trademark distinctiveness and modern tech/consumer brand appeal.',
        applied_weights: {
          brandability: 0.35,
          memorability: 0.25,
          liquidity: 0.15,
          tld_equity: 0.15,
          commercial_search: 0.05,
          economics_spread: 0.05,
        },
      };
    case 'exact_match_keyword':
      return {
        strategy_type: 'exact_match_keyword',
        label: 'Exact Match Keyword',
        description: 'Standard dictionary word or commercial product keyword phrase targeting direct search volume and category authority.',
        applied_weights: {
          commercial_search: 0.35,
          liquidity: 0.25,
          economics_spread: 0.15,
          tld_equity: 0.15,
          brandability: 0.05,
          memorability: 0.05,
        },
      };
    case 'geo_service':
      return {
        strategy_type: 'geo_service',
        label: 'Geo Local Service',
        description: 'Geographic location combined with a local trade or service intent for lead generation and local dominance.',
        applied_weights: {
          commercial_search: 0.35,
          economics_spread: 0.25,
          tld_equity: 0.20,
          liquidity: 0.10,
          brandability: 0.05,
          memorability: 0.05,
        },
      };
    case 'short_acronym_numeric':
      return {
        strategy_type: 'short_acronym_numeric',
        label: 'Short Acronym / Numeric',
        description: 'Ultra-short 2 to 4 character acronym, alphanumeric combination, or numeric domain with high intrinsic floor liquidity.',
        applied_weights: {
          liquidity: 0.40,
          tld_equity: 0.25,
          economics_spread: 0.20,
          brandability: 0.10,
          memorability: 0.05,
          commercial_search: 0.00,
        },
      };
    case 'tech_trend':
      return {
        strategy_type: 'tech_trend',
        label: 'Tech Trend / Emerging',
        description: 'Emerging technology terminology or trending tech ecosystem naming pattern with high venture capital appeal.',
        applied_weights: {
          memorability: 0.30,
          brandability: 0.25,
          liquidity: 0.20,
          commercial_search: 0.15,
          tld_equity: 0.10,
          economics_spread: 0.00,
        },
      };
    default:
      return {
        strategy_type: 'brandable',
        label: 'Brandable Startup',
        description: 'Modern brandable domain name.',
        applied_weights: {
          brandability: 0.35,
          memorability: 0.25,
          liquidity: 0.15,
          tld_equity: 0.15,
          commercial_search: 0.05,
          economics_spread: 0.05,
        },
      };
  }
}

/**
 * Deterministic local execution of Atomic JEV System One judgments
 */
export function evaluateJEVLocally(
  state: DomainState,
  mode: 'buy' | 'renew' | 'brand_selection' | 'renewal',
  startTime: number,
  missingKey = false,
  upstreamError?: {
    status: number;
    message: string;
    reason: string;
  }
): JEVResponse {
  const questions =
    mode === 'buy'
      ? JEV_MODE_A_QUESTIONS
      : mode === 'brand_selection'
      ? JEV_MODE_C_QUESTIONS
      : JEV_MODE_B_QUESTIONS;
  console.log(
    `[JEV Request Dispatcher] Mode: ${mode.toUpperCase()} | Questions Sent: [${Object.keys(questions).join(', ')}] | Questions Count: ${Object.keys(questions).length}`
  );

  const sld = state.domain.sld.toLowerCase();
  const tld = state.domain.tld;
  const isCom = tld === '.com' || tld === 'com';
  const isTier1 = state.domain.tld_tier === 'Tier 1' || isCom;

  // 0. Strategy archetype classification
  const strategyType = classifyDomainStrategy(state);

  // 1. Trademark atomic evaluation
  let tmChoice: 'clear' | 'low' | 'moderate' | 'high' | 'critical' = 'clear';
  let tmConfidence = 0.94;
  if (KNOWN_TRADEMARKS.some((tm) => sld === tm)) {
    tmChoice = 'critical';
    tmConfidence = 0.98;
  } else if (KNOWN_TRADEMARKS.some((tm) => sld.startsWith(tm) || sld.endsWith(tm))) {
    tmChoice = 'high';
    tmConfidence = 0.92;
  } else if (KNOWN_TRADEMARKS.some((tm) => sld.includes(tm))) {
    tmChoice = 'moderate';
    tmConfidence = 0.85;
  } else if (state.structure.is_dictionary_word) {
    tmChoice = 'low';
    tmConfidence = 0.90;
  } else {
    tmChoice = 'clear';
    tmConfidence = 0.94;
  }

  const tmFlagged = tmChoice === 'critical' || tmChoice === 'high';

  // 2. Brandability atomic score (0 to 4)
  let brandScore = 2; // Average default
  if (state.structure.has_hyphens_or_digits || state.structure.characters > 15 || !state.structure.pronounceable) {
    brandScore = state.structure.has_hyphens_or_digits && state.structure.characters > 16 ? 0 : 1;
  } else if (state.structure.characters <= 4 && state.structure.pronounceable && isTier1) {
    brandScore = 4; // Premium
  } else if (state.structure.characters <= 7 && state.structure.pronounceable) {
    brandScore = 3; // Strong
  } else if (state.structure.characters <= 11 && state.structure.pronounceable) {
    brandScore = 2; // Average
  } else {
    brandScore = 1; // Weak
  }

  const brandLevels = ['Unusable', 'Weak', 'Average', 'Strong', 'Premium'];
  const brandNormalized = brandScore === 4 ? 100 : brandScore === 3 ? 85 : brandScore === 2 ? 60 : brandScore === 1 ? 35 : 10;

  const latency = Math.max(12, Date.now() - startTime);

  if (mode === 'buy') {
    // Startup memorability noul (0.0 to 1.0)
    let memorability = 0.55;
    if (state.structure.characters <= 5 && state.structure.pronounceable) memorability += 0.35;
    else if (state.structure.characters <= 8 && state.structure.pronounceable) memorability += 0.20;
    else if (state.structure.characters > 12) memorability -= 0.25;
    if (state.structure.has_hyphens_or_digits) memorability -= 0.35;
    memorability = Math.max(0.05, Math.min(0.98, parseFloat(memorability.toFixed(2))));

    // Aftermarket liquidity choice
    let liquidityChoice: 'high_liquidity' | 'slow_speculative' | 'illiquid' = 'slow_speculative';
    let liquidityConfidence = 0.78;
    if (isTier1 && state.structure.characters <= 6 && state.structure.pronounceable && !state.structure.has_hyphens_or_digits) {
      liquidityChoice = 'high_liquidity';
      liquidityConfidence = 0.88;
    } else if (state.structure.characters > 14 || state.structure.has_hyphens_or_digits || state.domain.tld_tier === 'Tier 4') {
      liquidityChoice = 'illiquid';
      liquidityConfidence = 0.85;
    } else {
      liquidityChoice = 'slow_speculative';
      liquidityConfidence = 0.72;
    }

    // Speculative drag noul (0.0 to 1.0) - Null Safe
    let specDrag = 0.50;
    if (state.metrics_evidence.exact_search_volume !== null && state.metrics_evidence.exact_search_volume > 3000 && isTier1) {
      specDrag -= 0.30;
    }
    if (state.structure.has_hyphens_or_digits) specDrag += 0.35;
    if (state.domain.tld_tier === 'Tier 4') specDrag += 0.25;
    specDrag = Math.max(0.05, Math.min(0.95, parseFloat(specDrag.toFixed(2))));

    const modeAAnswers: ModeAJevAnswers = {
      domain_strategy_type: {
        choice: strategyType,
        confidence: 0.90,
      },
      brandability: {
        score: brandScore,
        confidence: 0.89,
        normalizedPercentage: brandNormalized,
        levelLabel: brandLevels[brandScore],
      },
      startup_memorability: {
        value: memorability,
        confidence: 0.85,
      },
      trademark_risk: {
        choice: tmChoice,
        confidence: tmConfidence,
        probabilities: {
          clear: tmChoice === 'clear' ? 0.90 : 0.05,
          low: tmChoice === 'low' ? 0.85 : 0.05,
          moderate: tmChoice === 'moderate' ? 0.75 : 0.10,
          high: tmChoice === 'high' ? 0.85 : 0.05,
          critical: tmChoice === 'critical' ? 0.95 : 0.02,
        },
      },
      aftermarket_liquidity: {
        choice: liquidityChoice,
        confidence: liquidityConfidence,
        probabilities: {
          high_liquidity: liquidityChoice === 'high_liquidity' ? 0.85 : 0.10,
          slow_speculative: liquidityChoice === 'slow_speculative' ? 0.70 : 0.20,
          illiquid: liquidityChoice === 'illiquid' ? 0.85 : 0.08,
        },
      },
      speculative_drag: {
        value: specDrag,
        confidence: 0.82,
      },
    };

    const overallConfidence = parseFloat(
      ((0.89 + 0.85 + tmConfidence + liquidityConfidence + 0.82 + 0.90) / 6).toFixed(2)
    );

    const rawJevPayload = {
      model: 'jev-latest',
      state,
      questions: JEV_MODE_A_QUESTIONS,
    };

    const rawJevResponse = {
      model: 'jev-latest',
      source: 'jev-engine-fallback',
      mode: 'buy',
      latencyMs: latency,
      timestamp: new Date().toISOString(),
      confidence: overallConfidence,
      answers: modeAAnswers,
      trademark_risk_flagged: tmFlagged,
      trademark_override_applied: tmFlagged,
    };

    return {
      model: 'jev-latest',
      source: 'jev-engine-fallback',
      latencyMs: latency,
      missingApiKey: missingKey,
      mode: 'buy',
      confidence: overallConfidence,
      rawJevPayload,
      rawJevResponse,
      modeAAnswers,
      answers: modeAAnswers,
      trademark_risk_flagged: tmFlagged,
      trademark_override_applied: tmFlagged,
      upstream_error: upstreamError,
    };
  } else if (mode === 'brand_selection') {
    // Mode C: Business Brand Selection & Comparative Decision
    const business = (state as any).business || {};
    const businessName = (business.business_name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const industry = (business.industry || '').toLowerCase();
    const hasPrefix = sld.startsWith('get') || sld.startsWith('try') || sld.startsWith('use') || sld.startsWith('the') || sld.startsWith('my') || sld.startsWith('app');
    const hasSuffix = sld.endsWith('app') || sld.endsWith('hq') || sld.endsWith('io') || sld.endsWith('ai') || sld.endsWith('lab') || sld.endsWith('labs');

    // 1. Business fit atomic score (0 to 3)
    let fitScore = 1;
    let fitConfidence = 0.86;
    if (businessName && sld === businessName) {
      fitScore = 3; // Category Defining
      fitConfidence = 0.95;
    } else if (businessName && (sld.includes(businessName) || businessName.includes(sld))) {
      fitScore = hasPrefix || hasSuffix ? 2 : 3;
      fitConfidence = 0.90;
    } else if (state.structure.is_dictionary_word || state.structure.characters <= 6) {
      fitScore = 2; // Strong generic
      fitConfidence = 0.82;
    } else if (state.structure.has_hyphens_or_digits || state.structure.characters > 14) {
      fitScore = 0; // Mismatched
      fitConfidence = 0.88;
    } else {
      fitScore = 1; // Marginal
      fitConfidence = 0.78;
    }
    const fitLevels = ['Mismatched', 'Marginal', 'Strong', 'Category Defining'];
    const fitNormalized = fitScore === 3 ? 100 : fitScore === 2 ? 75 : fitScore === 1 ? 45 : 15;

    // 2. Brand authority atomic score (0 to 2)
    let authScore = 1;
    let authConfidence = 0.88;
    if (state.structure.characters <= 6 && state.structure.pronounceable && !state.structure.has_hyphens_or_digits && isTier1) {
      authScore = 2; // High Brand Equity
      authConfidence = 0.94;
    } else if (state.structure.characters <= 10 && state.structure.pronounceable && !state.structure.has_hyphens_or_digits) {
      authScore = 1; // Acceptable
      authConfidence = 0.85;
    } else {
      authScore = 0; // Weak
      authConfidence = 0.89;
    }
    const authLevels = ['Weak', 'Acceptable', 'High Brand Equity'];
    const authNormalized = authScore === 2 ? 100 : authScore === 1 ? 60 : 20;

    // 3. TLD trust profile
    let tldChoice: 'gold_standard_com' | 'tech_accepted' | 'niche_friction' | 'risky_spam' = 'tech_accepted';
    let tldConfidence = 0.92;
    if (tld === '.com') {
      tldChoice = 'gold_standard_com';
      tldConfidence = 0.98;
    } else if (tld === '.ai' || tld === '.io' || tld === '.dev' || tld === '.app' || tld === '.tech') {
      tldChoice = 'tech_accepted';
      tldConfidence = 0.92;
    } else if (tld === '.co' || tld === '.org' || tld === '.net' || state.domain.tld_tier === 'Tier 2') {
      tldChoice = 'niche_friction';
      tldConfidence = 0.88;
    } else {
      tldChoice = 'risky_spam';
      tldConfidence = 0.85;
    }

    // 4. Verbal leakage risk noul (0.0 to 1.0)
    let leakage = 0.20;
    if (hasPrefix || hasSuffix) leakage += 0.40;
    if (state.structure.has_hyphens_or_digits) leakage += 0.35;
    if (tld !== '.com') leakage += 0.15;
    if (!state.structure.pronounceable) leakage += 0.25;
    leakage = Math.max(0.05, Math.min(0.95, parseFloat(leakage.toFixed(2))));

    const modeCAnswers: ModeCJevAnswers = {
      domain_strategy_type: {
        choice: strategyType,
        confidence: 0.90,
      },
      business_fit: {
        score: fitScore,
        confidence: fitConfidence,
        normalizedPercentage: fitNormalized,
        levelLabel: fitLevels[fitScore],
      },
      brand_authority: {
        score: authScore,
        confidence: authConfidence,
        normalizedPercentage: authNormalized,
        levelLabel: authLevels[authScore],
      },
      tld_trust_profile: {
        choice: tldChoice,
        confidence: tldConfidence,
        probabilities: {
          gold_standard_com: tldChoice === 'gold_standard_com' ? 0.90 : 0.05,
          tech_accepted: tldChoice === 'tech_accepted' ? 0.85 : 0.10,
          niche_friction: tldChoice === 'niche_friction' ? 0.80 : 0.15,
          risky_spam: tldChoice === 'risky_spam' ? 0.85 : 0.05,
        },
      },
      verbal_leakage_risk: {
        value: leakage,
        confidence: 0.85,
      },
      trademark_risk: {
        choice: tmChoice,
        confidence: tmConfidence,
      },
    };

    const overallConfidence = parseFloat(
      ((fitConfidence + authConfidence + tldConfidence + 0.85 + tmConfidence) / 5).toFixed(2)
    );

    const rawJevPayload = {
      model: 'jev-latest',
      state,
      questions: JEV_MODE_C_QUESTIONS,
    };

    const rawJevResponse = {
      model: 'jev-latest',
      source: 'jev-engine-fallback',
      mode: 'brand_selection',
      latencyMs: latency,
      timestamp: new Date().toISOString(),
      confidence: overallConfidence,
      answers: modeCAnswers,
      trademark_risk_flagged: tmFlagged,
      trademark_override_applied: tmFlagged,
    };

    return {
      model: 'jev-latest',
      source: 'jev-engine-fallback',
      latencyMs: latency,
      missingApiKey: missingKey,
      mode: 'brand_selection',
      confidence: overallConfidence,
      rawJevPayload,
      rawJevResponse,
      modeCAnswers,
      answers: modeCAnswers,
      trademark_risk_flagged: tmFlagged,
      trademark_override_applied: tmFlagged,
      upstream_error: upstreamError,
    };
  } else {
    // Mode B: Renewal - Null Safe
    const parkingRev = state.metrics_evidence.annual_parking_revenue_usd;
    const netCashflow = parkingRev !== null ? parkingRev - state.economics.annual_renewal_cost : null;
    const inbounds = state.metrics_evidence.inbound_inquiries_12m;

    let renewalChoice: 'essential_hold' | 'borderline_review' | 'drop_candidate' = 'borderline_review';
    let renewalConfidence = 0.75;

    if ((netCashflow !== null && netCashflow >= 0) || (inbounds !== null && inbounds >= 2) || (isTier1 && state.structure.characters <= 5)) {
      renewalChoice = 'essential_hold';
      renewalConfidence = 0.88;
    } else if ((inbounds === 0 || inbounds === null) && (netCashflow !== null && netCashflow < -30) && (state.structure.has_hyphens_or_digits || state.structure.characters > 14)) {
      renewalChoice = 'drop_candidate';
      renewalConfidence = 0.86;
    } else {
      renewalChoice = 'borderline_review';
      renewalConfidence = 0.72;
    }

    let inboundAppeal = 0.40;
    if (inbounds !== null && inbounds >= 1) inboundAppeal += 0.35;
    if (isTier1 && state.structure.characters <= 7) inboundAppeal += 0.20;
    if (state.structure.has_hyphens_or_digits) inboundAppeal -= 0.30;
    inboundAppeal = Math.max(0.05, Math.min(0.95, parseFloat(inboundAppeal.toFixed(2))));

    const modeBAnswers: ModeBJevAnswers = {
      domain_strategy_type: {
        choice: strategyType,
        confidence: 0.90,
      },
      renewal_justification: {
        choice: renewalChoice,
        confidence: renewalConfidence,
        probabilities: {
          essential_hold: renewalChoice === 'essential_hold' ? 0.85 : 0.10,
          borderline_review: renewalChoice === 'borderline_review' ? 0.70 : 0.20,
          drop_candidate: renewalChoice === 'drop_candidate' ? 0.85 : 0.08,
        },
      },
      inbound_monetization_appeal: {
        value: inboundAppeal,
        confidence: 0.82,
      },
      trademark_risk: {
        choice: tmChoice,
        confidence: tmConfidence,
      },
      brandability: {
        score: brandScore,
        confidence: 0.89,
        normalizedPercentage: brandNormalized,
        levelLabel: brandLevels[brandScore],
      },
    };

    const overallConfidence = parseFloat(
      ((renewalConfidence + 0.82 + tmConfidence + 0.89 + 0.90) / 5).toFixed(2)
    );

    const rawJevPayload = {
      model: 'jev-latest',
      state,
      questions: JEV_MODE_B_QUESTIONS,
    };

    const rawJevResponse = {
      model: 'jev-latest',
      source: 'jev-engine-fallback',
      mode: 'renew',
      latencyMs: latency,
      timestamp: new Date().toISOString(),
      confidence: overallConfidence,
      answers: modeBAnswers,
      trademark_risk_flagged: tmFlagged,
      trademark_override_applied: tmFlagged,
    };

    return {
      model: 'jev-latest',
      source: 'jev-engine-fallback',
      latencyMs: latency,
      missingApiKey: missingKey,
      mode: 'renew',
      confidence: overallConfidence,
      rawJevPayload,
      rawJevResponse,
      modeBAnswers,
      answers: modeBAnswers,
      trademark_risk_flagged: tmFlagged,
      trademark_override_applied: tmFlagged,
      upstream_error: upstreamError,
    };
  }
}

/**
 * Execute TypeSafe AI (JEV System One) Decision Engine via POST https://api.typesafe.ai/v1/systemone
 * Adheres strictly to docs.typesafe.ai Atomic Judgments specifications and Null Safety Directives.
 */
export async function queryTypeSafeJEV(
  state: DomainState | Record<string, any>,
  mode: 'buy' | 'renew' | 'brand_selection' | 'renewal',
  clientKey?: string
): Promise<JEVResponse> {
  const startTime = Date.now();
  const apiKey = (clientKey || process.env.TYPESAFE_API_KEY || '').trim();
  const questions =
    mode === 'buy'
      ? JEV_MODE_A_QUESTIONS
      : mode === 'brand_selection'
      ? JEV_MODE_C_QUESTIONS
      : JEV_MODE_B_QUESTIONS;

  console.log(
    `[JEV Request Dispatcher] Mode: ${mode.toUpperCase()} | Questions Sent: [${Object.keys(questions).join(', ')}] | Questions Count: ${Object.keys(questions).length}`
  );

  const payload = {
    model: 'jev-latest',
    state,
    questions,
  };

  if (!apiKey) {
    console.log(`[TypeSafe JEV Outbound] Key provided: NO | Status: Using local contract simulation`);
    return evaluateJEVLocally(state as DomainState, mode, startTime, true);
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const response = await fetch('https://api.typesafe.ai/v1/systemone', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'x-typesafe-key': apiKey,
        'User-Agent': 'DomainRadar-JevSystemOne/2.0',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    console.log(
      `[TypeSafe JEV Outbound] Key provided: YES (len ${apiKey.length}) | Status: ${response.status}`
    );

    if (!response.ok) {
      let errorBody = '';
      try {
        errorBody = await response.text();
      } catch {}
      console.warn(`TypeSafe API HTTP ${response.status}: ${errorBody || response.statusText}. Switched to local fallback.`);
      const upstreamError = {
        status: response.status,
        message: errorBody ? errorBody.slice(0, 160) : (response.statusText || 'Upstream request failed'),
        reason: response.status === 401 || response.status === 403
          ? 'Authentication rejected by api.typesafe.ai'
          : response.status === 429
          ? 'Rate limit exceeded on api.typesafe.ai'
          : `Upstream HTTP ${response.status} error`,
      };
      return evaluateJEVLocally(state as DomainState, mode, startTime, false, upstreamError);
    }

    const data: any = await response.json();
    const latency = Date.now() - startTime;
    const rawAnswers = data.answers || {};

    const detectedStrategy: DomainStrategyType = (rawAnswers.domain_strategy_type?.choice || classifyDomainStrategy(state as DomainState)) as DomainStrategyType;

    if (mode === 'buy') {
      const bScore = rawAnswers.brandability?.score ?? 2;
      const bNorm = bScore === 4 ? 100 : bScore === 3 ? 85 : bScore === 2 ? 60 : bScore === 1 ? 35 : 10;
      const brandLevels = ['Unusable', 'Weak', 'Average', 'Strong', 'Premium'];

      const tmChoice = (rawAnswers.trademark_risk?.choice || 'clear') as 'clear' | 'low' | 'moderate' | 'high' | 'critical';
      const tmFlagged = tmChoice === 'critical' || tmChoice === 'high';

      const modeAAnswers: ModeAJevAnswers = {
        domain_strategy_type: {
          choice: detectedStrategy,
          confidence: rawAnswers.domain_strategy_type?.confidence || 0.90,
        },
        brandability: {
          score: bScore,
          confidence: rawAnswers.brandability?.confidence || 0.88,
          normalizedPercentage: bNorm,
          levelLabel: brandLevels[Math.min(4, Math.max(0, bScore))],
        },
        startup_memorability: {
          value: typeof rawAnswers.startup_memorability?.value === 'number' ? rawAnswers.startup_memorability.value : 0.65,
          confidence: rawAnswers.startup_memorability?.confidence || 0.85,
        },
        trademark_risk: {
          choice: tmChoice,
          confidence: rawAnswers.trademark_risk?.confidence || 0.92,
          probabilities: rawAnswers.trademark_risk?.probabilities,
        },
        aftermarket_liquidity: {
          choice: (rawAnswers.aftermarket_liquidity?.choice || 'slow_speculative') as 'high_liquidity' | 'slow_speculative' | 'illiquid',
          confidence: rawAnswers.aftermarket_liquidity?.confidence || 0.80,
          probabilities: rawAnswers.aftermarket_liquidity?.probabilities,
        },
        speculative_drag: {
          value: typeof rawAnswers.speculative_drag?.value === 'number' ? rawAnswers.speculative_drag.value : 0.45,
          confidence: rawAnswers.speculative_drag?.confidence || 0.80,
        },
      };

      const overallConfidence = parseFloat(
        ((modeAAnswers.brandability.confidence +
          modeAAnswers.startup_memorability.confidence +
          modeAAnswers.trademark_risk.confidence +
          modeAAnswers.aftermarket_liquidity.confidence +
          modeAAnswers.speculative_drag.confidence) / 5).toFixed(2)
      );

      return {
        model: 'jev-latest',
        source: 'api.typesafe.ai',
        latencyMs: latency,
        missingApiKey: false,
        mode: 'buy',
        confidence: overallConfidence,
        rawJevPayload: payload,
        rawJevResponse: {
          ...data,
          latencyMs: latency,
          timestamp: new Date().toISOString(),
        },
        modeAAnswers,
        answers: modeAAnswers,
        trademark_risk_flagged: tmFlagged,
        trademark_override_applied: tmFlagged,
      };
    } else if (mode === 'brand_selection') {
      const fitScore = rawAnswers.business_fit?.score ?? 2;
      const fitLevels = ['Mismatched', 'Marginal', 'Strong', 'Category Defining'];
      const fitNorm = fitScore === 3 ? 100 : fitScore === 2 ? 75 : fitScore === 1 ? 45 : 15;

      const authScore = rawAnswers.brand_authority?.score ?? 1;
      const authLevels = ['Weak', 'Acceptable', 'High Brand Equity'];
      const authNorm = authScore === 2 ? 100 : authScore === 1 ? 60 : 20;

      const tmChoice = (rawAnswers.trademark_risk?.choice || 'clear') as 'clear' | 'low' | 'moderate' | 'high' | 'critical';
      const tmFlagged = tmChoice === 'critical' || tmChoice === 'high';

      const modeCAnswers: ModeCJevAnswers = {
        domain_strategy_type: {
          choice: detectedStrategy,
          confidence: rawAnswers.domain_strategy_type?.confidence || 0.90,
        },
        business_fit: {
          score: fitScore,
          confidence: rawAnswers.business_fit?.confidence || 0.90,
          normalizedPercentage: fitNorm,
          levelLabel: fitLevels[Math.min(3, Math.max(0, fitScore))],
        },
        brand_authority: {
          score: authScore,
          confidence: rawAnswers.brand_authority?.confidence || 0.88,
          normalizedPercentage: authNorm,
          levelLabel: authLevels[Math.min(2, Math.max(0, authScore))],
        },
        tld_trust_profile: {
          choice: (rawAnswers.tld_trust_profile?.choice || 'tech_accepted') as any,
          confidence: rawAnswers.tld_trust_profile?.confidence || 0.92,
        },
        verbal_leakage_risk: {
          value: typeof rawAnswers.verbal_leakage_risk?.value === 'number' ? rawAnswers.verbal_leakage_risk.value : 0.30,
          confidence: rawAnswers.verbal_leakage_risk?.confidence || 0.85,
        },
        trademark_risk: {
          choice: tmChoice,
          confidence: rawAnswers.trademark_risk?.confidence || 0.92,
        },
      };

      const overallConfidence = parseFloat(
        ((modeCAnswers.business_fit.confidence +
          modeCAnswers.brand_authority.confidence +
          modeCAnswers.tld_trust_profile.confidence +
          modeCAnswers.verbal_leakage_risk.confidence +
          modeCAnswers.trademark_risk.confidence) / 5).toFixed(2)
      );

      return {
        model: 'jev-latest',
        source: 'api.typesafe.ai',
        latencyMs: latency,
        missingApiKey: false,
        mode: 'brand_selection',
        confidence: overallConfidence,
        rawJevPayload: payload,
        rawJevResponse: {
          ...data,
          latencyMs: latency,
          timestamp: new Date().toISOString(),
        },
        modeCAnswers,
        answers: modeCAnswers,
        trademark_risk_flagged: tmFlagged,
        trademark_override_applied: tmFlagged,
      };
    } else {
      const bScore = rawAnswers.brandability?.score ?? 2;
      const bNorm = bScore === 4 ? 100 : bScore === 3 ? 85 : bScore === 2 ? 60 : bScore === 1 ? 35 : 10;
      const brandLevels = ['Unusable', 'Weak', 'Average', 'Strong', 'Premium'];

      const tmChoice = (rawAnswers.trademark_risk?.choice || 'clear') as 'clear' | 'low' | 'moderate' | 'high' | 'critical';
      const tmFlagged = tmChoice === 'critical' || tmChoice === 'high';

      const modeBAnswers: ModeBJevAnswers = {
        domain_strategy_type: {
          choice: detectedStrategy,
          confidence: rawAnswers.domain_strategy_type?.confidence || 0.90,
        },
        renewal_justification: {
          choice: (rawAnswers.renewal_justification?.choice || 'borderline_review') as 'essential_hold' | 'borderline_review' | 'drop_candidate',
          confidence: rawAnswers.renewal_justification?.confidence || 0.82,
          probabilities: rawAnswers.renewal_justification?.probabilities,
        },
        inbound_monetization_appeal: {
          value: typeof rawAnswers.inbound_monetization_appeal?.value === 'number' ? rawAnswers.inbound_monetization_appeal.value : 0.50,
          confidence: rawAnswers.inbound_monetization_appeal?.confidence || 0.80,
        },
        trademark_risk: {
          choice: tmChoice,
          confidence: rawAnswers.trademark_risk?.confidence || 0.92,
        },
        brandability: {
          score: bScore,
          confidence: rawAnswers.brandability?.confidence || 0.88,
          normalizedPercentage: bNorm,
          levelLabel: brandLevels[Math.min(4, Math.max(0, bScore))],
        },
      };

      const overallConfidence = parseFloat(
        ((modeBAnswers.renewal_justification.confidence +
          modeBAnswers.inbound_monetization_appeal.confidence +
          modeBAnswers.trademark_risk.confidence +
          modeBAnswers.brandability.confidence) / 4).toFixed(2)
      );

      return {
        model: 'jev-latest',
        source: 'api.typesafe.ai',
        latencyMs: latency,
        missingApiKey: false,
        mode: 'renew',
        confidence: overallConfidence,
        rawJevPayload: payload,
        rawJevResponse: {
          ...data,
          latencyMs: latency,
          timestamp: new Date().toISOString(),
        },
        modeBAnswers,
        answers: modeBAnswers,
        trademark_risk_flagged: tmFlagged,
        trademark_override_applied: tmFlagged,
      };
    }
  } catch (err: any) {
    console.log(
      `[TypeSafe JEV Outbound] Key provided: ${apiKey ? 'YES (len ' + apiKey.length + ')' : 'NO'} | Status: NETWORK_ERROR (${err.message})`
    );
    const upstreamError = {
      status: 0,
      message: err.name === 'AbortError' ? 'Upstream request timed out (5000ms limit)' : (err.message || 'Network unreachable'),
      reason: 'Network connection failure or timeout',
    };
    return evaluateJEVLocally(state as DomainState, mode, startTime, false, upstreamError);
  }
}
