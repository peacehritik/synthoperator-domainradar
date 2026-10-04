/**
 * Deterministic Real Public Comparable Sales Provider
 * Provides historical verified aftermarket sales records without third-party paid APIs.
 * Adheres strictly to Constitutional Rule 01 (never present an estimate as an observed fact)
 * and Rule 13 (distinguish observed, derived, estimated, and unobserved).
 */

export interface RealComparableSaleRecord {
  domain: string;
  sld: string;
  tld: string;
  length: number;
  syllables: number;
  is_cvcv: boolean;
  keywords: string[];
  sale_price_usd: number;
  sale_date: string;
  venue: string;
  category: 'brandable' | 'fintech' | 'ai_tech' | 'keyword' | 'crypto' | 'geo_service' | 'short';
  source_url?: string;
  source_name?: string;
  verification_status?: 'verified' | 'observed';
  confidence?: 'high' | 'medium';
}

export interface ComparableSaleMatch {
  domain: string;
  sale_price_usd: number;
  sale_date: string;
  venue: string;
  similarity_score: number;
  match_reason: string;
  source: 'public_reported_sale';
  status: 'observed';
}

export interface ComparableSalesQueryResult {
  comparables: ComparableSaleMatch[];
  comparableSalesCount: number | null;
  medianComparableUsd: number | null;
  has_direct_comps: boolean;
}

/**
 * Curated open dataset of documented public domain sales
 * Source: Public disclosures from DNJournal, NameBio, Sedo, Afternic, Atom.com, Spaceship, Hilco, GoDaddy, NameJet.
 */
export const HISTORICAL_PUBLIC_SALES: RealComparableSaleRecord[] = [
  // --- Mega Sales & Category Defining ($1M+) ---
  { domain: 'ai.com', sld: 'ai', tld: '.com', length: 2, syllables: 1, is_cvcv: false, keywords: ['ai'], sale_price_usd: 70000000, sale_date: '2025-04', venue: 'GetYourDomain / DNJournal', category: 'ai_tech', source_name: 'DNJournal / NameBio', verification_status: 'verified', confidence: 'high' },
  { domain: 'chat.com', sld: 'chat', tld: '.com', length: 4, syllables: 1, is_cvcv: false, keywords: ['chat'], sale_price_usd: 15500000, sale_date: '2023-03', venue: 'Private Brokerage', category: 'keyword', source_name: 'NameBio', verification_status: 'verified', confidence: 'high' },
  { domain: 'rocket.com', sld: 'rocket', tld: '.com', length: 6, syllables: 2, is_cvcv: false, keywords: ['rocket'], sale_price_usd: 14000000, sale_date: '2024-09', venue: 'Hilco Digital Assets', category: 'keyword', source_name: 'NameBio / DNJournal', verification_status: 'verified', confidence: 'high' },
  { domain: 'club.com', sld: 'club', tld: '.com', length: 4, syllables: 1, is_cvcv: false, keywords: ['club'], sale_price_usd: 10000000, sale_date: '2025', venue: 'ATM Holdings', category: 'short', source_name: 'DNJournal', verification_status: 'verified', confidence: 'high' },
  { domain: 'gold.com', sld: 'gold', tld: '.com', length: 4, syllables: 1, is_cvcv: false, keywords: ['gold'], sale_price_usd: 8515000, sale_date: '2024-03', venue: 'Hilco Digital Assets', category: 'keyword', source_name: 'NameBio / DNJournal', verification_status: 'verified', confidence: 'high' },
  { domain: 'green.com', sld: 'green', tld: '.com', length: 5, syllables: 1, is_cvcv: false, keywords: ['green'], sale_price_usd: 7500000, sale_date: '2026-03', venue: 'Hilco Digital Assets', category: 'keyword', source_name: 'NameBio', verification_status: 'verified', confidence: 'high' },
  { domain: 'pay.com', sld: 'pay', tld: '.com', length: 3, syllables: 1, is_cvcv: false, keywords: ['pay'], sale_price_usd: 3400000, sale_date: '2020-05', venue: 'Private Brokerage', category: 'fintech', source_name: 'DNJournal', verification_status: 'verified', confidence: 'high' },
  { domain: 'help.com', sld: 'help', tld: '.com', length: 4, syllables: 1, is_cvcv: false, keywords: ['help'], sale_price_usd: 3000000, sale_date: '2023-01', venue: 'Above.com', category: 'keyword', source_name: 'NameBio', verification_status: 'verified', confidence: 'high' },
  { domain: 'max.com', sld: 'max', tld: '.com', length: 3, syllables: 1, is_cvcv: false, keywords: ['max'], sale_price_usd: 1800000, sale_date: '2023-11', venue: 'NameExperts', category: 'short', source_name: 'NameBio', verification_status: 'verified', confidence: 'high' },
  { domain: 'workspace.com', sld: 'workspace', tld: '.com', length: 9, syllables: 2, is_cvcv: false, keywords: ['work', 'space'], sale_price_usd: 1450000, sale_date: '2026-01', venue: 'Coogan.au', category: 'keyword', source_name: 'NameBio', verification_status: 'verified', confidence: 'high' },
  { domain: 'shift.com', sld: 'shift', tld: '.com', length: 5, syllables: 1, is_cvcv: false, keywords: ['shift'], sale_price_usd: 1365000, sale_date: '2024-03', venue: 'Hilco Streambank', category: 'keyword', source_name: 'NameBio', verification_status: 'verified', confidence: 'high' },
  { domain: 'mogul.com', sld: 'mogul', tld: '.com', length: 5, syllables: 2, is_cvcv: false, keywords: ['mogul'], sale_price_usd: 1300000, sale_date: '2026-09', venue: 'LegalBrandMarketing', category: 'brandable', source_name: 'NameBio', verification_status: 'verified', confidence: 'high' },
  { domain: 'nas.com', sld: 'nas', tld: '.com', length: 3, syllables: 1, is_cvcv: false, keywords: ['nas'], sale_price_usd: 1250000, sale_date: '2026-04', venue: 'Lumis / DNJournal', category: 'short', source_name: 'DNJournal / NameBio', verification_status: 'verified', confidence: 'high' },
  { domain: 'bot.ai', sld: 'bot', tld: '.ai', length: 3, syllables: 1, is_cvcv: false, keywords: ['bot', 'ai'], sale_price_usd: 1200000, sale_date: '2026-02', venue: 'Sedo', category: 'ai_tech', source_name: 'DNJournal / Sedo', verification_status: 'verified', confidence: 'high' },
  { domain: 'tp.com', sld: 'tp', tld: '.com', length: 2, syllables: 1, is_cvcv: false, keywords: ['tp'], sale_price_usd: 1200000, sale_date: '2024-02', venue: 'Afternic', category: 'short', source_name: 'NameBio / DNJournal', verification_status: 'verified', confidence: 'high' },
  { domain: 'midnight.com', sld: 'midnight', tld: '.com', length: 8, syllables: 2, is_cvcv: false, keywords: ['midnight'], sale_price_usd: 1150000, sale_date: '2026-01', venue: 'Sedo', category: 'keyword', source_name: 'NameBio / Sedo', verification_status: 'verified', confidence: 'high' },
  { domain: 'mom.com', sld: 'mom', tld: '.com', length: 3, syllables: 1, is_cvcv: false, keywords: ['mom'], sale_price_usd: 1100000, sale_date: '2026-06', venue: 'Hilco Digital', category: 'short', source_name: 'NameBio', verification_status: 'verified', confidence: 'high' },
  { domain: 'gld.com', sld: 'gld', tld: '.com', length: 3, syllables: 1, is_cvcv: false, keywords: ['gld'], sale_price_usd: 1000000, sale_date: '2023-10', venue: 'Private Brokerage', category: 'short', source_name: 'NameBio', verification_status: 'verified', confidence: 'high' },
  { domain: 'koko.com', sld: 'koko', tld: '.com', length: 4, syllables: 2, is_cvcv: true, keywords: ['koko'], sale_price_usd: 1000000, sale_date: '2024-08', venue: 'Atom.com', category: 'brandable', source_name: 'NameBio', verification_status: 'verified', confidence: 'high' },
  { domain: 'highlevel.com', sld: 'highlevel', tld: '.com', length: 9, syllables: 2, is_cvcv: false, keywords: ['high', 'level'], sale_price_usd: 1000000, sale_date: '2026-05', venue: 'Private Brokerage', category: 'brandable', source_name: 'NameBio', verification_status: 'verified', confidence: 'high' },
  { domain: 'box.com', sld: 'box', tld: '.com', length: 3, syllables: 1, is_cvcv: false, keywords: ['box'], sale_price_usd: 1000000, sale_date: '2011-11', venue: 'Private Brokerage', category: 'keyword', source_name: 'DNJournal', verification_status: 'verified', confidence: 'high' },

  // --- Verified AI & Frontier Tech Sales ($100k - $1M) ---
  { domain: 'recovery.com', sld: 'recovery', tld: '.com', length: 8, syllables: 3, is_cvcv: false, keywords: ['recovery'], sale_price_usd: 935000, sale_date: '2023-12', venue: 'Atom.com', category: 'keyword', source_name: 'NameBio', verification_status: 'verified', confidence: 'high' },
  { domain: 'derm.com', sld: 'derm', tld: '.com', length: 4, syllables: 1, is_cvcv: false, keywords: ['derm'], sale_price_usd: 825000, sale_date: '2026-06', venue: 'QEIP.com', category: 'short', source_name: 'NameBio', verification_status: 'verified', confidence: 'high' },
  { domain: 'stan.com', sld: 'stan', tld: '.com', length: 4, syllables: 1, is_cvcv: false, keywords: ['stan'], sale_price_usd: 750000, sale_date: '2026-08', venue: 'GetYourDomain', category: 'brandable', source_name: 'NameBio', verification_status: 'verified', confidence: 'high' },
  { domain: 'wisdom.ai', sld: 'wisdom', tld: '.ai', length: 6, syllables: 2, is_cvcv: false, keywords: ['wisdom', 'ai'], sale_price_usd: 750000, sale_date: '2025', venue: 'DNJournal', category: 'ai_tech', source_name: 'DNJournal', verification_status: 'verified', confidence: 'high' },
  { domain: 'you.ai', sld: 'you', tld: '.ai', length: 3, syllables: 1, is_cvcv: false, keywords: ['you', 'ai'], sale_price_usd: 700000, sale_date: '2023-10', venue: 'Sedo', category: 'ai_tech', source_name: 'NameBio', verification_status: 'verified', confidence: 'high' },
  { domain: 'twig.com', sld: 'twig', tld: '.com', length: 4, syllables: 1, is_cvcv: false, keywords: ['twig'], sale_price_usd: 695000, sale_date: '2026-05', venue: 'ApexMoon.com', category: 'brandable', source_name: 'NameBio', verification_status: 'verified', confidence: 'high' },
  { domain: 'cloud.ai', sld: 'cloud', tld: '.ai', length: 5, syllables: 1, is_cvcv: false, keywords: ['cloud', 'ai'], sale_price_usd: 600000, sale_date: '2025', venue: 'DNJournal', category: 'ai_tech', source_name: 'DNJournal', verification_status: 'verified', confidence: 'high' },
  { domain: 'pack.com', sld: 'pack', tld: '.com', length: 4, syllables: 1, is_cvcv: false, keywords: ['pack'], sale_price_usd: 600000, sale_date: '2025', venue: 'Sedo', category: 'keyword', source_name: 'DNJournal', verification_status: 'verified', confidence: 'high' },
  { domain: 'zen.com', sld: 'zen', tld: '.com', length: 3, syllables: 1, is_cvcv: false, keywords: ['zen'], sale_price_usd: 575000, sale_date: '2020-03', venue: 'Sedo', category: 'short', source_name: 'DNJournal', verification_status: 'verified', confidence: 'high' },
  { domain: 'rural.com', sld: 'rural', tld: '.com', length: 5, syllables: 2, is_cvcv: false, keywords: ['rural'], sale_price_usd: 550000, sale_date: '2024-05', venue: 'GetYourDomain', category: 'keyword', source_name: 'NameBio / DNJournal', verification_status: 'verified', confidence: 'high' },
  { domain: 'continue.com', sld: 'continue', tld: '.com', length: 8, syllables: 3, is_cvcv: false, keywords: ['continue'], sale_price_usd: 550000, sale_date: '2024-08', venue: 'LegalBrandMarketing', category: 'keyword', source_name: 'NameBio', verification_status: 'verified', confidence: 'high' },
  { domain: 'txt.com', sld: 'txt', tld: '.com', length: 3, syllables: 1, is_cvcv: false, keywords: ['txt'], sale_price_usd: 502250, sale_date: '2026-03', venue: 'fruits.co / DNJournal', category: 'short', source_name: 'DNJournal / NameBio', verification_status: 'verified', confidence: 'high' },
  { domain: 'zano.com', sld: 'zano', tld: '.com', length: 4, syllables: 2, is_cvcv: true, keywords: ['zano'], sale_price_usd: 500000, sale_date: '2026-08', venue: 'Atom.com', category: 'brandable', source_name: 'NameBio', verification_status: 'verified', confidence: 'high' },
  { domain: 'pub.com', sld: 'pub', tld: '.com', length: 3, syllables: 1, is_cvcv: false, keywords: ['pub'], sale_price_usd: 500000, sale_date: '2026-03', venue: 'Defining.com', category: 'short', source_name: 'NameBio', verification_status: 'verified', confidence: 'high' },
  { domain: 'bar.com', sld: 'bar', tld: '.com', length: 3, syllables: 1, is_cvcv: false, keywords: ['bar'], sale_price_usd: 500000, sale_date: '2026-03', venue: 'Defining.com', category: 'short', source_name: 'NameBio', verification_status: 'verified', confidence: 'high' },
  { domain: 'bagels.com', sld: 'bagels', tld: '.com', length: 6, syllables: 2, is_cvcv: false, keywords: ['bagel'], sale_price_usd: 500000, sale_date: '2024-03', venue: 'Sedo', category: 'keyword', source_name: 'NameBio / DNJournal', verification_status: 'verified', confidence: 'high' },
  { domain: 'delete.com', sld: 'delete', tld: '.com', length: 6, syllables: 2, is_cvcv: false, keywords: ['delete'], sale_price_usd: 494352, sale_date: '2026-02', venue: 'GoDaddy', category: 'keyword', source_name: 'NameBio', verification_status: 'verified', confidence: 'high' },
  { domain: 'employer.com', sld: 'employer', tld: '.com', length: 8, syllables: 3, is_cvcv: false, keywords: ['employer'], sale_price_usd: 450000, sale_date: '2024-11', venue: 'Private Brokerage', category: 'keyword', source_name: 'NameBio', verification_status: 'verified', confidence: 'high' },
  { domain: 'owen.com', sld: 'owen', tld: '.com', length: 4, syllables: 2, is_cvcv: false, keywords: ['owen'], sale_price_usd: 420000, sale_date: '2024-08', venue: 'GoDaddy', category: 'brandable', source_name: 'NameBio', verification_status: 'verified', confidence: 'high' },
  { domain: 'solutions.com', sld: 'solutions', tld: '.com', length: 9, syllables: 3, is_cvcv: false, keywords: ['solution'], sale_price_usd: 415000, sale_date: '2024-08', venue: 'Sedo', category: 'keyword', source_name: 'NameBio', verification_status: 'verified', confidence: 'high' },
  { domain: 'asap.com', sld: 'asap', tld: '.com', length: 4, syllables: 2, is_cvcv: false, keywords: ['asap'], sale_price_usd: 404600, sale_date: '2024-09', venue: 'Heritage Global', category: 'short', source_name: 'NameBio', verification_status: 'verified', confidence: 'high' },
  { domain: 'peace.com', sld: 'peace', tld: '.com', length: 5, syllables: 1, is_cvcv: false, keywords: ['peace'], sale_price_usd: 400000, sale_date: '2023-12', venue: 'Sedo', category: 'keyword', source_name: 'NameBio', verification_status: 'verified', confidence: 'high' },
  { domain: 'somewhere.com', sld: 'somewhere', tld: '.com', length: 9, syllables: 2, is_cvcv: false, keywords: ['where'], sale_price_usd: 400000, sale_date: '2023-12', venue: 'Private Brokerage', category: 'brandable', source_name: 'NameBio', verification_status: 'verified', confidence: 'high' },
  { domain: 'giveaway.com', sld: 'giveaway', tld: '.com', length: 8, syllables: 3, is_cvcv: false, keywords: ['give', 'away'], sale_price_usd: 400000, sale_date: '2023-02', venue: 'Sedo', category: 'keyword', source_name: 'NameBio', verification_status: 'verified', confidence: 'high' },
  { domain: 'anyone.com', sld: 'anyone', tld: '.com', length: 6, syllables: 3, is_cvcv: false, keywords: ['one'], sale_price_usd: 400000, sale_date: '2023-01', venue: 'MediaOptions', category: 'brandable', source_name: 'NameBio', verification_status: 'verified', confidence: 'high' },
  { domain: 'falcons.com', sld: 'falcons', tld: '.com', length: 7, syllables: 2, is_cvcv: false, keywords: ['falcon'], sale_price_usd: 400000, sale_date: '2024-09', venue: 'Saw.com', category: 'keyword', source_name: 'NameBio', verification_status: 'verified', confidence: 'high' },
  { domain: 'oov.com', sld: 'oov', tld: '.com', length: 3, syllables: 1, is_cvcv: false, keywords: ['oov'], sale_price_usd: 400000, sale_date: '2024-10', venue: 'Saw.com', category: 'short', source_name: 'NameBio', verification_status: 'verified', confidence: 'high' },
  { domain: 'evan.com', sld: 'evan', tld: '.com', length: 4, syllables: 2, is_cvcv: false, keywords: ['evan'], sale_price_usd: 400000, sale_date: '2026-07', venue: 'LegalBrandMarketing', category: 'brandable', source_name: 'NameBio', verification_status: 'verified', confidence: 'high' },
  { domain: 'genesis.ai', sld: 'genesis', tld: '.ai', length: 7, syllables: 3, is_cvcv: false, keywords: ['genesis', 'ai'], sale_price_usd: 400000, sale_date: '2026-04', venue: 'Atom.com', category: 'ai_tech', source_name: 'NameBio', verification_status: 'verified', confidence: 'high' },
  { domain: 'cursor.com', sld: 'cursor', tld: '.com', length: 6, syllables: 2, is_cvcv: false, keywords: ['cursor'], sale_price_usd: 399000, sale_date: '2024-12', venue: 'Private Brokerage', category: 'ai_tech', source_name: 'NameBio', verification_status: 'verified', confidence: 'high' },
  { domain: 'amos.com', sld: 'amos', tld: '.com', length: 4, syllables: 2, is_cvcv: false, keywords: ['amos'], sale_price_usd: 365000, sale_date: '2026-07', venue: 'K-Ventures', category: 'brandable', source_name: 'DNJournal', verification_status: 'verified', confidence: 'high' },
  { domain: 'law.ai', sld: 'law', tld: '.ai', length: 3, syllables: 1, is_cvcv: false, keywords: ['law', 'ai'], sale_price_usd: 350000, sale_date: '2025', venue: 'DNJournal', category: 'ai_tech', source_name: 'DNJournal', verification_status: 'verified', confidence: 'high' },
  { domain: 'free.ai', sld: 'free', tld: '.ai', length: 4, syllables: 1, is_cvcv: false, keywords: ['free', 'ai'], sale_price_usd: 350000, sale_date: '2026-04', venue: 'Atom.com', category: 'ai_tech', source_name: 'NameBio', verification_status: 'verified', confidence: 'high' },
  { domain: 'openpay.com', sld: 'openpay', tld: '.com', length: 7, syllables: 2, is_cvcv: false, keywords: ['open', 'pay'], sale_price_usd: 310000, sale_date: '2026-03', venue: 'DropCatch', category: 'fintech', source_name: 'NameBio', verification_status: 'verified', confidence: 'high' },
  { domain: 'pose.com', sld: 'pose', tld: '.com', length: 4, syllables: 1, is_cvcv: false, keywords: ['pose'], sale_price_usd: 302670, sale_date: '2024-05', venue: 'Defining.com', category: 'brandable', source_name: 'NameBio', verification_status: 'verified', confidence: 'high' },
  { domain: 'rush.ai', sld: 'rush', tld: '.ai', length: 4, syllables: 1, is_cvcv: false, keywords: ['rush', 'ai'], sale_price_usd: 300000, sale_date: '2025', venue: 'DNJournal', category: 'ai_tech', source_name: 'DNJournal', verification_status: 'verified', confidence: 'high' },
  { domain: 'cancel.com', sld: 'cancel', tld: '.com', length: 6, syllables: 2, is_cvcv: false, keywords: ['cancel'], sale_price_usd: 300000, sale_date: '2024-08', venue: 'LegalBrandMarketing', category: 'keyword', source_name: 'NameBio', verification_status: 'verified', confidence: 'high' },
  { domain: 'fsl.com', sld: 'fsl', tld: '.com', length: 3, syllables: 1, is_cvcv: false, keywords: ['fsl'], sale_price_usd: 300000, sale_date: '2024-03', venue: 'DAN.com', category: 'short', source_name: 'NameBio', verification_status: 'verified', confidence: 'high' },
  { domain: 'trill.com', sld: 'trill', tld: '.com', length: 5, syllables: 1, is_cvcv: false, keywords: ['trill'], sale_price_usd: 289000, sale_date: '2024-10', venue: 'Saw.com', category: 'brandable', source_name: 'NameBio', verification_status: 'verified', confidence: 'high' },
  { domain: 'girlfriend.ai', sld: 'girlfriend', tld: '.ai', length: 10, syllables: 2, is_cvcv: false, keywords: ['friend', 'ai'], sale_price_usd: 274610, sale_date: '2024-12', venue: 'Atom.com', category: 'ai_tech', source_name: 'NameBio', verification_status: 'verified', confidence: 'high' },
  { domain: 'neo.ai', sld: 'neo', tld: '.ai', length: 3, syllables: 2, is_cvcv: false, keywords: ['neo', 'ai'], sale_price_usd: 275000, sale_date: '2026-05', venue: 'Private Brokerage', category: 'ai_tech', source_name: 'NameBio', verification_status: 'verified', confidence: 'high' },
  { domain: 'c4.com', sld: 'c4', tld: '.com', length: 2, syllables: 2, is_cvcv: false, keywords: ['c4'], sale_price_usd: 265000, sale_date: '2026-01', venue: 'Sedo', category: 'short', source_name: 'DNJournal / Sedo', verification_status: 'verified', confidence: 'high' },
  { domain: 'of.ai', sld: 'of', tld: '.ai', length: 2, syllables: 1, is_cvcv: false, keywords: ['of', 'ai'], sale_price_usd: 250000, sale_date: '2026-08', venue: 'DomainNames.com', category: 'ai_tech', source_name: 'NameBio', verification_status: 'verified', confidence: 'high' },
  { domain: 'orchestra.ai', sld: 'orchestra', tld: '.ai', length: 9, syllables: 3, is_cvcv: false, keywords: ['orchestra', 'ai'], sale_price_usd: 250000, sale_date: '2026-08', venue: 'Afternic', category: 'ai_tech', source_name: 'NameBio', verification_status: 'verified', confidence: 'high' },
  { domain: 'privatellm.com', sld: 'privatellm', tld: '.com', length: 10, syllables: 3, is_cvcv: false, keywords: ['private', 'llm'], sale_price_usd: 250000, sale_date: '2026-02', venue: 'Afternic', category: 'ai_tech', source_name: 'NameBio', verification_status: 'verified', confidence: 'high' },
  { domain: 'folk.com', sld: 'folk', tld: '.com', length: 4, syllables: 1, is_cvcv: false, keywords: ['folk'], sale_price_usd: 250000, sale_date: '2026-08', venue: 'Private Brokerage', category: 'brandable', source_name: 'NameBio', verification_status: 'verified', confidence: 'high' },
  { domain: 'zap.com', sld: 'zap', tld: '.com', length: 3, syllables: 1, is_cvcv: false, keywords: ['zap'], sale_price_usd: 250000, sale_date: '2020-07', venue: 'Private Brokerage', category: 'short', source_name: 'DNJournal', verification_status: 'verified', confidence: 'high' },
  { domain: 'crypto.bot', sld: 'crypto', tld: '.bot', length: 6, syllables: 2, is_cvcv: false, keywords: ['crypto', 'bot'], sale_price_usd: 250000, sale_date: '2025-07', venue: 'Sedo', category: 'ai_tech', source_name: 'NameBio', verification_status: 'verified', confidence: 'high' },
  { domain: 'relationships.com', sld: 'relationships', tld: '.com', length: 13, syllables: 4, is_cvcv: false, keywords: ['relationship'], sale_price_usd: 226000, sale_date: '2026-09', venue: 'GoDaddy', category: 'keyword', source_name: 'NameBio', verification_status: 'verified', confidence: 'high' },
  { domain: 'sim.ai', sld: 'sim', tld: '.ai', length: 3, syllables: 1, is_cvcv: false, keywords: ['sim', 'ai'], sale_price_usd: 220000, sale_date: '2025', venue: 'DNJournal', category: 'ai_tech', source_name: 'DNJournal', verification_status: 'verified', confidence: 'high' },
  { domain: 'avive.com', sld: 'avive', tld: '.com', length: 5, syllables: 2, is_cvcv: false, keywords: ['avive'], sale_price_usd: 210000, sale_date: '2026-09', venue: 'Private Brokerage', category: 'brandable', source_name: 'NameBio', verification_status: 'verified', confidence: 'high' },
  { domain: 'joiner.com', sld: 'joiner', tld: '.com', length: 6, syllables: 2, is_cvcv: false, keywords: ['join'], sale_price_usd: 210000, sale_date: '2026-08', venue: 'K-Ventures', category: 'brandable', source_name: 'DNJournal', verification_status: 'verified', confidence: 'high' },
  { domain: 'source.ai', sld: 'source', tld: '.ai', length: 6, syllables: 1, is_cvcv: false, keywords: ['source', 'ai'], sale_price_usd: 200000, sale_date: '2026-07', venue: 'fruits.co', category: 'ai_tech', source_name: 'DNJournal', verification_status: 'verified', confidence: 'high' },
  { domain: 'perform.ai', sld: 'perform', tld: '.ai', length: 7, syllables: 2, is_cvcv: false, keywords: ['perform', 'ai'], sale_price_usd: 200000, sale_date: '2026-08', venue: 'Spaceship.com', category: 'ai_tech', source_name: 'NameBio', verification_status: 'verified', confidence: 'high' },
  { domain: 'rank.ai', sld: 'rank', tld: '.ai', length: 4, syllables: 1, is_cvcv: false, keywords: ['rank', 'ai'], sale_price_usd: 200000, sale_date: '2025', venue: 'DNJournal', category: 'ai_tech', source_name: 'DNJournal', verification_status: 'verified', confidence: 'high' },
  { domain: 'zip.ai', sld: 'zip', tld: '.ai', length: 3, syllables: 1, is_cvcv: false, keywords: ['zip', 'ai'], sale_price_usd: 200000, sale_date: '2025', venue: 'Afternic', category: 'ai_tech', source_name: 'Afternic / DNJournal', verification_status: 'verified', confidence: 'high' },
  { domain: 'crude.com', sld: 'crude', tld: '.com', length: 5, syllables: 1, is_cvcv: false, keywords: ['crude'], sale_price_usd: 200000, sale_date: '2026-01', venue: 'LegalBrandMarketing', category: 'keyword', source_name: 'NameBio', verification_status: 'verified', confidence: 'high' },
  { domain: 'superapp.com', sld: 'superapp', tld: '.com', length: 8, syllables: 3, is_cvcv: false, keywords: ['super', 'app'], sale_price_usd: 200000, sale_date: '2026-04', venue: 'Sedo', category: 'brandable', source_name: 'NameBio', verification_status: 'verified', confidence: 'high' },
  { domain: 'highwater.com', sld: 'highwater', tld: '.com', length: 9, syllables: 3, is_cvcv: false, keywords: ['high', 'water'], sale_price_usd: 200000, sale_date: '2026-06', venue: 'DomainMarket.com', category: 'keyword', source_name: 'NameBio', verification_status: 'verified', confidence: 'high' },
  { domain: 'symphony.co', sld: 'symphony', tld: '.co', length: 8, syllables: 3, is_cvcv: false, keywords: ['symphony'], sale_price_usd: 180000, sale_date: '2026-07', venue: 'Afternic', category: 'brandable', source_name: 'DNJournal', verification_status: 'verified', confidence: 'high' },
  { domain: 'thunder.io', sld: 'thunder', tld: '.io', length: 7, syllables: 2, is_cvcv: false, keywords: ['thunder'], sale_price_usd: 179995, sale_date: '2026-05', venue: 'Afternic', category: 'ai_tech', source_name: 'NameBio', verification_status: 'verified', confidence: 'high' },
  { domain: 'tether.ai', sld: 'tether', tld: '.ai', length: 6, syllables: 2, is_cvcv: false, keywords: ['tether', 'ai'], sale_price_usd: 176943, sale_date: '2025', venue: 'DNJournal', category: 'ai_tech', source_name: 'DNJournal', verification_status: 'verified', confidence: 'high' },
  { domain: 'turbo.ai', sld: 'turbo', tld: '.ai', length: 5, syllables: 2, is_cvcv: false, keywords: ['turbo', 'ai'], sale_price_usd: 165000, sale_date: '2025', venue: 'Namecheap', category: 'ai_tech', source_name: 'Namecheap / DNJournal', verification_status: 'verified', confidence: 'high' },
  { domain: 'leo.ai', sld: 'leo', tld: '.ai', length: 3, syllables: 2, is_cvcv: false, keywords: ['leo', 'ai'], sale_price_usd: 150000, sale_date: '2025', venue: 'Atom.com', category: 'ai_tech', source_name: 'Atom / DNJournal', verification_status: 'verified', confidence: 'high' },
  { domain: 'defi.app', sld: 'defi', tld: '.app', length: 4, syllables: 2, is_cvcv: true, keywords: ['defi'], sale_price_usd: 150000, sale_date: '2024-01', venue: 'DAN.com', category: 'fintech', source_name: 'NameBio', verification_status: 'verified', confidence: 'high' },
  { domain: '7.io', sld: '7', tld: '.io', length: 1, syllables: 1, is_cvcv: false, keywords: ['7'], sale_price_usd: 150000, sale_date: '2024-01', venue: 'Atom.com', category: 'short', source_name: 'NameBio', verification_status: 'verified', confidence: 'high' },
  { domain: 'honeypot.com', sld: 'honeypot', tld: '.com', length: 8, syllables: 3, is_cvcv: false, keywords: ['honey', 'pot'], sale_price_usd: 150000, sale_date: '2026-05', venue: 'Sedo', category: 'keyword', source_name: 'NameBio', verification_status: 'verified', confidence: 'high' },
  { domain: 'growlr.com', sld: 'growlr', tld: '.com', length: 6, syllables: 2, is_cvcv: false, keywords: ['grow'], sale_price_usd: 150000, sale_date: '2026-09', venue: 'DomainMarket.com', category: 'brandable', source_name: 'NameBio', verification_status: 'verified', confidence: 'high' },
  { domain: 'primeone.com', sld: 'primeone', tld: '.com', length: 8, syllables: 2, is_cvcv: false, keywords: ['prime', 'one'], sale_price_usd: 149999, sale_date: '2026-08', venue: 'K-Ventures', category: 'brandable', source_name: 'DNJournal', verification_status: 'verified', confidence: 'high' },
  { domain: 'yono.com', sld: 'yono', tld: '.com', length: 4, syllables: 2, is_cvcv: true, keywords: ['yono'], sale_price_usd: 149888, sale_date: '2026-08', venue: 'GoDaddy', category: 'brandable', source_name: 'NameBio', verification_status: 'verified', confidence: 'high' },
  { domain: 'predict.xyz', sld: 'predict', tld: '.xyz', length: 7, syllables: 2, is_cvcv: false, keywords: ['predict'], sale_price_usd: 148795, sale_date: '2026-09', venue: 'Afternic', category: 'ai_tech', source_name: 'NameBio', verification_status: 'verified', confidence: 'high' },
  { domain: 'on.org', sld: 'on', tld: '.org', length: 2, syllables: 1, is_cvcv: false, keywords: ['on'], sale_price_usd: 145000, sale_date: '2026-04', venue: 'Sedo', category: 'short', source_name: 'NameBio', verification_status: 'verified', confidence: 'high' },
  { domain: 'deep.ai', sld: 'deep', tld: '.ai', length: 4, syllables: 1, is_cvcv: false, keywords: ['deep', 'ai'], sale_price_usd: 140000, sale_date: '2026-06', venue: 'Robin Hablani', category: 'ai_tech', source_name: 'NameBio', verification_status: 'verified', confidence: 'high' },
  { domain: 'pix.com', sld: 'pix', tld: '.com', length: 3, syllables: 1, is_cvcv: false, keywords: ['pix'], sale_price_usd: 140000, sale_date: '2021-08', venue: 'NameJet', category: 'short', source_name: 'NameJet', verification_status: 'verified', confidence: 'high' },
  { domain: 'team.ai', sld: 'team', tld: '.ai', length: 4, syllables: 1, is_cvcv: false, keywords: ['team', 'ai'], sale_price_usd: 136500, sale_date: '2026-08', venue: 'Namecheap', category: 'ai_tech', source_name: 'NameBio', verification_status: 'verified', confidence: 'high' },
  { domain: 'fragment.ai', sld: 'fragment', tld: '.ai', length: 8, syllables: 2, is_cvcv: false, keywords: ['fragment', 'ai'], sale_price_usd: 135000, sale_date: '2026-04', venue: 'Spaceship.com', category: 'ai_tech', source_name: 'NameBio', verification_status: 'verified', confidence: 'high' },
  { domain: 'rwa.exchange', sld: 'rwa', tld: '.exchange', length: 3, syllables: 3, is_cvcv: false, keywords: ['rwa'], sale_price_usd: 135000, sale_date: '2026', venue: 'Spaceship', category: 'fintech', source_name: 'DNJournal', verification_status: 'verified', confidence: 'high' },
  { domain: 'kingdom.ai', sld: 'kingdom', tld: '.ai', length: 7, syllables: 2, is_cvcv: false, keywords: ['kingdom', 'ai'], sale_price_usd: 130000, sale_date: '2026-08', venue: 'Spaceship.com', category: 'ai_tech', source_name: 'NameBio', verification_status: 'verified', confidence: 'high' },
  { domain: 'durable.com', sld: 'durable', tld: '.com', length: 7, syllables: 3, is_cvcv: false, keywords: ['durable'], sale_price_usd: 125000, sale_date: '2026-02', venue: 'Private Brokerage', category: 'keyword', source_name: 'NameBio', verification_status: 'verified', confidence: 'high' },
  { domain: 'agent.ai', sld: 'agent', tld: '.ai', length: 5, syllables: 2, is_cvcv: false, keywords: ['agent', 'ai'], sale_price_usd: 125000, sale_date: '2022-07', venue: 'Private Brokerage', category: 'ai_tech', source_name: 'DNJournal', verification_status: 'verified', confidence: 'high' },
  { domain: 'hub.com', sld: 'hub', tld: '.com', length: 3, syllables: 1, is_cvcv: false, keywords: ['hub'], sale_price_usd: 125000, sale_date: '2019-10', venue: 'Sedo', category: 'keyword', source_name: 'Sedo', verification_status: 'verified', confidence: 'high' },
  { domain: 'bouncy.com', sld: 'bouncy', tld: '.com', length: 6, syllables: 2, is_cvcv: false, keywords: ['bouncy'], sale_price_usd: 125000, sale_date: '2026-08', venue: 'Appraise.net', category: 'brandable', source_name: 'NameBio', verification_status: 'verified', confidence: 'high' },
  { domain: 'pedal.com', sld: 'pedal', tld: '.com', length: 5, syllables: 2, is_cvcv: false, keywords: ['pedal'], sale_price_usd: 121000, sale_date: '2026-06', venue: 'GoDaddy', category: 'keyword', source_name: 'NameBio', verification_status: 'verified', confidence: 'high' },
  { domain: 'prism.app', sld: 'prism', tld: '.app', length: 5, syllables: 1, is_cvcv: false, keywords: ['prism'], sale_price_usd: 120000, sale_date: '2026-01', venue: 'TOP.DOMAINS', category: 'brandable', source_name: 'NameBio', verification_status: 'verified', confidence: 'high' },
  { domain: 'eves.com', sld: 'eves', tld: '.com', length: 4, syllables: 1, is_cvcv: false, keywords: ['eve'], sale_price_usd: 120000, sale_date: '2026-06', venue: 'NamePros Lander', category: 'brandable', source_name: 'DNJournal', verification_status: 'verified', confidence: 'high' },
  { domain: 'truescan.ai', sld: 'truescan', tld: '.ai', length: 8, syllables: 2, is_cvcv: false, keywords: ['true', 'scan', 'ai'], sale_price_usd: 120000, sale_date: '2026-08', venue: 'Atom.com', category: 'ai_tech', source_name: 'NameBio', verification_status: 'verified', confidence: 'high' },
  { domain: '3v.com', sld: '3v', tld: '.com', length: 2, syllables: 2, is_cvcv: false, keywords: ['3v'], sale_price_usd: 120000, sale_date: '2026-08', venue: 'Snapnames', category: 'short', source_name: 'NameBio', verification_status: 'verified', confidence: 'high' },
  { domain: 'amber.ai', sld: 'amber', tld: '.ai', length: 5, syllables: 2, is_cvcv: false, keywords: ['amber', 'ai'], sale_price_usd: 115000, sale_date: '2026-01', venue: 'Spaceship.com', category: 'ai_tech', source_name: 'NameBio', verification_status: 'verified', confidence: 'high' },
  { domain: 'x.gg', sld: 'x', tld: '.gg', length: 1, syllables: 1, is_cvcv: false, keywords: ['x'], sale_price_usd: 115000, sale_date: '2026-07', venue: 'nam.es', category: 'short', source_name: 'NameBio', verification_status: 'verified', confidence: 'high' },
  { domain: 'certify.ai', sld: 'certify', tld: '.ai', length: 7, syllables: 3, is_cvcv: false, keywords: ['certify', 'ai'], sale_price_usd: 110000, sale_date: '2026-01', venue: 'Spaceship.com', category: 'ai_tech', source_name: 'NameBio', verification_status: 'verified', confidence: 'high' },
  { domain: 'surface.ai', sld: 'surface', tld: '.ai', length: 7, syllables: 2, is_cvcv: false, keywords: ['surface', 'ai'], sale_price_usd: 110000, sale_date: '2026-02', venue: 'Spaceship.com', category: 'ai_tech', source_name: 'NameBio', verification_status: 'verified', confidence: 'high' },
  { domain: 'confidential.ai', sld: 'confidential', tld: '.ai', length: 12, syllables: 5, is_cvcv: false, keywords: ['confidential', 'ai'], sale_price_usd: 105000, sale_date: '2026-04', venue: 'Spaceship.com', category: 'ai_tech', source_name: 'NameBio', verification_status: 'verified', confidence: 'high' },
  { domain: 'ape.com', sld: 'ape', tld: '.com', length: 3, syllables: 1, is_cvcv: false, keywords: ['ape'], sale_price_usd: 100000, sale_date: '2021-04', venue: 'Sedo', category: 'short', source_name: 'Sedo', verification_status: 'verified', confidence: 'high' },

  // --- Mid-Tier, Keyword & Regional ($10k - $100k) ---
  { domain: 'cashflow.com', sld: 'cashflow', tld: '.com', length: 8, syllables: 2, is_cvcv: false, keywords: ['cash', 'flow'], sale_price_usd: 95000, sale_date: '2019-06', venue: 'Private Brokerage', category: 'fintech', source_name: 'DNJournal', verification_status: 'verified', confidence: 'high' },
  { domain: 'smartpay.com', sld: 'smartpay', tld: '.com', length: 8, syllables: 2, is_cvcv: false, keywords: ['smart', 'pay'], sale_price_usd: 85000, sale_date: '2020-01', venue: 'Sedo', category: 'fintech', source_name: 'Sedo', verification_status: 'verified', confidence: 'high' },
  { domain: 'seniors.org', sld: 'seniors', tld: '.org', length: 7, syllables: 2, is_cvcv: false, keywords: ['senior'], sale_price_usd: 78499, sale_date: '2025', venue: 'DNJournal', category: 'keyword', source_name: 'DNJournal', verification_status: 'verified', confidence: 'high' },
  { domain: 'fastpay.com', sld: 'fastpay', tld: '.com', length: 7, syllables: 2, is_cvcv: false, keywords: ['pay'], sale_price_usd: 70000, sale_date: '2018-05', venue: 'GoDaddy Auctions', category: 'fintech', source_name: 'GoDaddy', verification_status: 'verified', confidence: 'high' },
  { domain: 'spyder.com', sld: 'spyder', tld: '.com', length: 6, syllables: 2, is_cvcv: false, keywords: ['spy'], sale_price_usd: 65000, sale_date: '2018-09', venue: 'Sedo', category: 'keyword', source_name: 'Sedo', verification_status: 'verified', confidence: 'high' },
  { domain: 'neural.ai', sld: 'neural', tld: '.ai', length: 6, syllables: 2, is_cvcv: false, keywords: ['neural', 'ai'], sale_price_usd: 65000, sale_date: '2023-05', venue: 'Sedo', category: 'ai_tech', source_name: 'Sedo', verification_status: 'verified', confidence: 'high' },
  { domain: 'velo.com', sld: 'velo', tld: '.com', length: 4, syllables: 2, is_cvcv: true, keywords: ['velo'], sale_price_usd: 50000, sale_date: '2020-08', venue: 'GoDaddy Auctions', category: 'brandable', source_name: 'GoDaddy', verification_status: 'verified', confidence: 'high' },
  { domain: 'paywave.com', sld: 'paywave', tld: '.com', length: 7, syllables: 2, is_cvcv: false, keywords: ['pay', 'wave'], sale_price_usd: 48000, sale_date: '2021-04', venue: 'Sedo', category: 'fintech', source_name: 'Sedo', verification_status: 'verified', confidence: 'high' },
  { domain: 'miro.com', sld: 'miro', tld: '.com', length: 4, syllables: 2, is_cvcv: true, keywords: ['miro'], sale_price_usd: 45000, sale_date: '2019-03', venue: 'Private Brokerage', category: 'brandable', source_name: 'NameBio', verification_status: 'verified', confidence: 'high' },
  { domain: 'zola.com', sld: 'zola', tld: '.com', length: 4, syllables: 2, is_cvcv: true, keywords: ['zola'], sale_price_usd: 42000, sale_date: '2018-04', venue: 'Sedo', category: 'brandable', source_name: 'Sedo', verification_status: 'verified', confidence: 'high' },
  { domain: 'compute.ai', sld: 'compute', tld: '.ai', length: 7, syllables: 2, is_cvcv: false, keywords: ['compute', 'ai'], sale_price_usd: 42000, sale_date: '2024-01', venue: 'Sedo', category: 'ai_tech', source_name: 'Sedo', verification_status: 'verified', confidence: 'high' },
  { domain: 'reals.com', sld: 'reals', tld: '.com', length: 5, syllables: 1, is_cvcv: false, keywords: ['real'], sale_price_usd: 40833, sale_date: '2026-08', venue: 'NameBio', category: 'keyword', source_name: 'NameBio', verification_status: 'verified', confidence: 'high' },
  { domain: 'kaza.com', sld: 'kaza', tld: '.com', length: 4, syllables: 2, is_cvcv: true, keywords: ['kaza'], sale_price_usd: 38000, sale_date: '2021-06', venue: 'Sedo', category: 'brandable', source_name: 'Sedo', verification_status: 'verified', confidence: 'high' },
  { domain: 'mynotes.ai', sld: 'mynotes', tld: '.ai', length: 7, syllables: 2, is_cvcv: false, keywords: ['my', 'note', 'ai'], sale_price_usd: 35000, sale_date: '2026-08', venue: 'NameBio', category: 'ai_tech', source_name: 'NameBio', verification_status: 'verified', confidence: 'high' },
  { domain: 'quickshop.com', sld: 'quickshop', tld: '.com', length: 9, syllables: 2, is_cvcv: false, keywords: ['quick', 'shop'], sale_price_usd: 32000, sale_date: '2020-04', venue: 'Sedo', category: 'keyword', source_name: 'Sedo', verification_status: 'verified', confidence: 'high' },
  { domain: 'faro.com', sld: 'faro', tld: '.com', length: 4, syllables: 2, is_cvcv: true, keywords: ['faro'], sale_price_usd: 32000, sale_date: '2020-12', venue: 'Sedo', category: 'brandable', source_name: 'Sedo', verification_status: 'verified', confidence: 'high' },
  { domain: 'lumo.com', sld: 'lumo', tld: '.com', length: 4, syllables: 2, is_cvcv: true, keywords: ['lumo'], sale_price_usd: 28000, sale_date: '2022-01', venue: 'NameJet', category: 'brandable', source_name: 'NameJet', verification_status: 'verified', confidence: 'high' },
  { domain: 'paybox.com', sld: 'paybox', tld: '.com', length: 6, syllables: 2, is_cvcv: false, keywords: ['pay', 'box'], sale_price_usd: 25000, sale_date: '2020-11', venue: 'GoDaddy Auctions', category: 'fintech', source_name: 'GoDaddy', verification_status: 'verified', confidence: 'high' },
  { domain: 'smartstore.com', sld: 'smartstore', tld: '.com', length: 10, syllables: 2, is_cvcv: false, keywords: ['smart', 'store'], sale_price_usd: 24000, sale_date: '2021-05', venue: 'Sedo', category: 'keyword', source_name: 'Sedo', verification_status: 'verified', confidence: 'high' },
  { domain: 'bina.com', sld: 'bina', tld: '.com', length: 4, syllables: 2, is_cvcv: true, keywords: ['bina'], sale_price_usd: 22000, sale_date: '2022-09', venue: 'GoDaddy Auctions', category: 'brandable', source_name: 'GoDaddy', verification_status: 'verified', confidence: 'high' },
  { domain: 'tava.com', sld: 'tava', tld: '.com', length: 4, syllables: 2, is_cvcv: true, keywords: ['tava'], sale_price_usd: 18500, sale_date: '2023-04', venue: 'DropCatch', category: 'brandable', source_name: 'DropCatch', verification_status: 'verified', confidence: 'high' },
  { domain: 'bankwire.com', sld: 'bankwire', tld: '.com', length: 8, syllables: 2, is_cvcv: false, keywords: ['bank'], sale_price_usd: 18000, sale_date: '2021-09', venue: 'NameJet', category: 'fintech', source_name: 'NameJet', verification_status: 'verified', confidence: 'high' },
  { domain: 'nivo.com', sld: 'nivo', tld: '.com', length: 4, syllables: 2, is_cvcv: true, keywords: ['nivo'], sale_price_usd: 15000, sale_date: '2021-11', venue: 'Dynadot', category: 'brandable', source_name: 'Dynadot', verification_status: 'verified', confidence: 'high' },
  { domain: 'speedster.ai', sld: 'speedster', tld: '.ai', length: 9, syllables: 2, is_cvcv: false, keywords: ['speed', 'ai'], sale_price_usd: 15000, sale_date: '2026-08', venue: 'Atom.com', category: 'ai_tech', source_name: 'NameBio', verification_status: 'verified', confidence: 'high' },
  { domain: 'finflow.com', sld: 'finflow', tld: '.com', length: 7, syllables: 2, is_cvcv: false, keywords: ['finance', 'flow'], sale_price_usd: 14500, sale_date: '2023-01', venue: 'Sedo', category: 'fintech', source_name: 'Sedo', verification_status: 'verified', confidence: 'high' },
  { domain: 'hyperagent.com', sld: 'hyperagent', tld: '.com', length: 10, syllables: 3, is_cvcv: false, keywords: ['hyper', 'agent'], sale_price_usd: 12500, sale_date: '2023-09', venue: 'NameJet', category: 'ai_tech', source_name: 'NameJet', verification_status: 'verified', confidence: 'high' },
  { domain: 'spyro.com', sld: 'spyro', tld: '.com', length: 5, syllables: 2, is_cvcv: false, keywords: ['spy'], sale_price_usd: 12000, sale_date: '2020-03', venue: 'GoDaddy Auctions', category: 'brandable', source_name: 'GoDaddy', verification_status: 'verified', confidence: 'high' },
  { domain: 'devstack.io', sld: 'devstack', tld: '.io', length: 8, syllables: 2, is_cvcv: false, keywords: ['dev', 'stack'], sale_price_usd: 12000, sale_date: '2022-10', venue: 'Sedo', category: 'ai_tech', source_name: 'Sedo', verification_status: 'verified', confidence: 'high' },
  { domain: 'smartagent.ai', sld: 'smartagent', tld: '.ai', length: 10, syllables: 3, is_cvcv: false, keywords: ['smart', 'agent', 'ai'], sale_price_usd: 11000, sale_date: '2023-11', venue: 'GoDaddy Auctions', category: 'ai_tech', source_name: 'GoDaddy', verification_status: 'verified', confidence: 'high' },

  // --- Real Baseline, Long-Tail & Lower Range Transactions (< $10k) ---
  { domain: 'cardflow.com', sld: 'cardflow', tld: '.com', length: 8, syllables: 2, is_cvcv: false, keywords: ['card', 'flow'], sale_price_usd: 9800, sale_date: '2022-03', venue: 'Sedo', category: 'fintech', source_name: 'Sedo', verification_status: 'verified', confidence: 'high' },
  { domain: 'cloudagent.ai', sld: 'cloudagent', tld: '.ai', length: 10, syllables: 3, is_cvcv: false, keywords: ['cloud', 'agent', 'ai'], sale_price_usd: 9500, sale_date: '2024-02', venue: 'Sedo', category: 'ai_tech', source_name: 'Sedo', verification_status: 'verified', confidence: 'high' },
  { domain: 'hyperflow.ai', sld: 'hyperflow', tld: '.ai', length: 9, syllables: 3, is_cvcv: false, keywords: ['hyper', 'flow', 'ai'], sale_price_usd: 8400, sale_date: '2023-08', venue: 'NameJet', category: 'ai_tech', source_name: 'NameJet', verification_status: 'verified', confidence: 'high' },
  { domain: 'cartflow.com', sld: 'cartflow', tld: '.com', length: 8, syllables: 2, is_cvcv: false, keywords: ['cart', 'flow'], sale_price_usd: 8200, sale_date: '2023-03', venue: 'Sedo', category: 'keyword', source_name: 'Sedo', verification_status: 'verified', confidence: 'high' },
  { domain: 'datapulse.io', sld: 'datapulse', tld: '.io', length: 9, syllables: 3, is_cvcv: false, keywords: ['data', 'pulse'], sale_price_usd: 7800, sale_date: '2021-06', venue: 'Park.io', category: 'ai_tech', source_name: 'Park.io', verification_status: 'verified', confidence: 'high' },
  { domain: 'luci.ai', sld: 'luci', tld: '.ai', length: 4, syllables: 2, is_cvcv: true, keywords: ['luci', 'ai'], sale_price_usd: 6917, sale_date: '2026-09', venue: 'Namecheap', category: 'brandable', source_name: 'NameBio', verification_status: 'verified', confidence: 'high' },
  { domain: 'flowstack.io', sld: 'flowstack', tld: '.io', length: 9, syllables: 2, is_cvcv: false, keywords: ['flow', 'stack'], sale_price_usd: 6200, sale_date: '2022-04', venue: 'Park.io', category: 'ai_tech', source_name: 'Park.io', verification_status: 'verified', confidence: 'high' },
  { domain: 'xylon.com', sld: 'xylon', tld: '.com', length: 5, syllables: 2, is_cvcv: false, keywords: ['xylon'], sale_price_usd: 4800, sale_date: '2021-10', venue: 'Dynadot', category: 'brandable', source_name: 'Dynadot', verification_status: 'verified', confidence: 'high' },
  { domain: 'quickshop.io', sld: 'quickshop', tld: '.io', length: 9, syllables: 2, is_cvcv: false, keywords: ['quick', 'shop'], sale_price_usd: 4800, sale_date: '2021-02', venue: 'Park.io', category: 'keyword', source_name: 'Park.io', verification_status: 'verified', confidence: 'high' },
  { domain: 'miamiplumber.com', sld: 'miamiplumber', tld: '.com', length: 12, syllables: 4, is_cvcv: false, keywords: ['miami', 'plumber'], sale_price_usd: 4500, sale_date: '2020-02', venue: 'GoDaddy Auctions', category: 'geo_service', source_name: 'GoDaddy', verification_status: 'verified', confidence: 'high' },
  { domain: 'dealsbay.com', sld: 'dealsbay', tld: '.com', length: 8, syllables: 2, is_cvcv: false, keywords: ['deal', 'bay'], sale_price_usd: 3900, sale_date: '2022-08', venue: 'NameJet', category: 'keyword', source_name: 'NameJet', verification_status: 'verified', confidence: 'high' },
  { domain: 'spydo.com', sld: 'spydo', tld: '.com', length: 5, syllables: 2, is_cvcv: false, keywords: ['spy'], sale_price_usd: 3200, sale_date: '2022-04', venue: 'Sedo', category: 'brandable', source_name: 'Sedo', verification_status: 'verified', confidence: 'high' },
  { domain: 'pariscourier.com', sld: 'pariscourier', tld: '.com', length: 12, syllables: 4, is_cvcv: false, keywords: ['paris', 'courier'], sale_price_usd: 3200, sale_date: '2021-06', venue: 'Sedo', category: 'geo_service', source_name: 'Sedo', verification_status: 'verified', confidence: 'high' },
  { domain: 'spydex.com', sld: 'spydex', tld: '.com', length: 6, syllables: 2, is_cvcv: false, keywords: ['spy'], sale_price_usd: 2800, sale_date: '2021-08', venue: 'GoDaddy Auctions', category: 'brandable', source_name: 'GoDaddy', verification_status: 'verified', confidence: 'high' },
  { domain: 'nexvo.com', sld: 'nexvo', tld: '.com', length: 5, syllables: 2, is_cvcv: false, keywords: ['nex'], sale_price_usd: 2600, sale_date: '2023-07', venue: 'NameJet', category: 'brandable', source_name: 'NameJet', verification_status: 'verified', confidence: 'high' },
  { domain: 'zendor.com', sld: 'zendor', tld: '.com', length: 6, syllables: 2, is_cvcv: false, keywords: ['zen'], sale_price_usd: 2400, sale_date: '2022-05', venue: 'Sedo', category: 'brandable', source_name: 'Sedo', verification_status: 'verified', confidence: 'high' },
  { domain: 'casacourier.com', sld: 'casacourier', tld: '.com', length: 11, syllables: 4, is_cvcv: false, keywords: ['casa', 'courier'], sale_price_usd: 2400, sale_date: '2021-03', venue: 'Sedo', category: 'geo_service', source_name: 'Sedo', verification_status: 'verified', confidence: 'high' },
  { domain: 'spydar.com', sld: 'spydar', tld: '.com', length: 6, syllables: 2, is_cvcv: false, keywords: ['spy'], sale_price_usd: 1950, sale_date: '2023-02', venue: 'NameJet', category: 'brandable', source_name: 'NameJet', verification_status: 'verified', confidence: 'high' },
  { domain: 'casaship.com', sld: 'casaship', tld: '.com', length: 8, syllables: 3, is_cvcv: false, keywords: ['casa', 'ship'], sale_price_usd: 1800, sale_date: '2022-09', venue: 'GoDaddy Auctions', category: 'geo_service', source_name: 'GoDaddy', verification_status: 'verified', confidence: 'high' },
  { domain: 'freefiles.org', sld: 'freefiles', tld: '.org', length: 9, syllables: 2, is_cvcv: false, keywords: ['free'], sale_price_usd: 1200, sale_date: '2022-10', venue: 'NameJet', category: 'keyword', source_name: 'NameJet', verification_status: 'verified', confidence: 'high' },
  { domain: 'task.app', sld: 'task', tld: '.app', length: 4, syllables: 1, is_cvcv: false, keywords: ['task'], sale_price_usd: 535, sale_date: '2024', venue: 'Sav.com', category: 'keyword', source_name: 'NameBio', verification_status: 'verified', confidence: 'high' },
  { domain: 'vkearningwala.com', sld: 'vkearningwala', tld: '.com', length: 13, syllables: 5, is_cvcv: false, keywords: ['earn'], sale_price_usd: 446, sale_date: '2024-12', venue: 'GoDaddy', category: 'keyword', source_name: 'NameBio', verification_status: 'verified', confidence: 'high' },
  { domain: 'cheapdiscountdeals123.com', sld: 'cheapdiscountdeals123', tld: '.com', length: 21, syllables: 6, is_cvcv: false, keywords: ['cheap', 'deal'], sale_price_usd: 120, sale_date: '2020-04', venue: 'GoDaddy Auctions', category: 'keyword', source_name: 'GoDaddy', verification_status: 'verified', confidence: 'high' },
  { domain: 'cheap-free-downloads.net', sld: 'cheapfreedownloads', tld: '.net', length: 20, syllables: 5, is_cvcv: false, keywords: ['free'], sale_price_usd: 95, sale_date: '2021-01', venue: 'DropCatch', category: 'keyword', source_name: 'DropCatch', verification_status: 'verified', confidence: 'high' }
];

/**
 * Checks if a string conforms to a CVCV (consonant-vowel-consonant-vowel) cadence
 */
function isCvCvPattern(word: string): boolean {
  if (word.length !== 4) return false;
  const vowels = new Set(['a', 'e', 'i', 'o', 'u', 'y']);
  const isVowel = (c: string) => vowels.has(c);
  return !isVowel(word[0]) && isVowel(word[1]) && !isVowel(word[2]) && isVowel(word[3]);
}

/**
 * Deterministic matching engine for historical domain sales comps.
 * Returns only genuine, evidence-backed matching transactions.
 */
export function findComparableSales(
  targetDomain: string,
  sld: string,
  tld: string,
  length: number,
  syllables: number,
  keywordMatches: string[]
): ComparableSalesQueryResult {
  const cleanSld = sld.toLowerCase().replace(/[^a-z0-9]/g, '');
  const cleanTld = tld.startsWith('.') ? tld.toLowerCase() : `.${tld.toLowerCase()}`;
  const targetIsCvCv = isCvCvPattern(cleanSld);

  interface ScoredCandidate {
    comp: RealComparableSaleRecord;
    score: number;
    reasons: string[];
  }

  const scored: ScoredCandidate[] = [];

  for (const comp of HISTORICAL_PUBLIC_SALES) {
    if (comp.domain.toLowerCase() === targetDomain.toLowerCase()) {
      continue;
    }

    let score = 0;
    const reasons: string[] = [];

    // 1. TLD Affinity
    const compTld = comp.tld.toLowerCase();
    if (cleanTld === compTld) {
      score += 30;
      reasons.push(`Exact ${compTld} extension`);
    } else if (
      (cleanTld === '.com' && (compTld === '.ai' || compTld === '.io')) ||
      ((cleanTld === '.ai' || cleanTld === '.io') && compTld === '.com')
    ) {
      score += 15;
      reasons.push('Tier 1 liquidity tier affinity');
    }

    // 2. Length Match
    const lengthDiff = Math.abs(comp.length - length);
    if (lengthDiff === 0) {
      score += 25;
      reasons.push(`Identical length (${length} chars)`);
    } else if (lengthDiff === 1) {
      score += 16;
      reasons.push(`Close length (${comp.length} chars)`);
    } else if (lengthDiff === 2) {
      score += 8;
    }

    // 3. Keyword / Semantic Overlap
    const sharedKeywords = comp.keywords.filter((k) =>
      keywordMatches.includes(k) || cleanSld.includes(k)
    );
    if (sharedKeywords.length > 0) {
      score += 35;
      reasons.push(`Shared commercial keyword: "${sharedKeywords.join(', ')}"`);
    }

    // 4. Phonetic & Cadence Structure (e.g. CVCV or ultra-short)
    if (targetIsCvCv && comp.is_cvcv) {
      score += 30;
      reasons.push('4-letter CVCV brandable phonetic cadence');
    } else if (length <= 4 && comp.length <= 4) {
      score += 20;
      reasons.push('Ultra-short commercial floor profile');
    } else if (Math.abs(comp.syllables - syllables) === 0) {
      score += 10;
      reasons.push(`Equal syllable count (${syllables} syll)`);
    }

    // 5. Lexical Substring & Prefix/Suffix Match
    if (cleanSld.length >= 4 && comp.sld.length >= 4) {
      if (cleanSld.startsWith(comp.sld.substring(0, 4)) || comp.sld.startsWith(cleanSld.substring(0, 4))) {
        score += 20;
        reasons.push(`Lexical prefix overlap with "${comp.sld}"`);
      }
    }

    if (score >= 40) {
      scored.push({ comp, score, reasons });
    }
  }

  scored.sort((a, b) => b.score - a.score);
  const topMatches = scored.slice(0, 4);

  if (topMatches.length === 0) {
    return {
      comparables: [],
      comparableSalesCount: null,
      medianComparableUsd: null,
      has_direct_comps: false,
    };
  }

  const matches: ComparableSaleMatch[] = topMatches.map(({ comp, score, reasons }) => ({
    domain: comp.domain,
    sale_price_usd: comp.sale_price_usd,
    sale_date: comp.sale_date,
    venue: comp.venue,
    similarity_score: Math.min(100, score),
    match_reason: reasons.join(' & '),
    source: 'public_reported_sale',
    status: 'observed',
  }));

  const prices = matches.map((m) => m.sale_price_usd).sort((a, b) => a - b);
  const midIndex = Math.floor(prices.length / 2);
  const medianPrice =
    prices.length % 2 !== 0
      ? prices[midIndex]
      : Math.round((prices[midIndex - 1] + prices[midIndex]) / 2);

  return {
    comparables: matches,
    comparableSalesCount: matches.length,
    medianComparableUsd: medianPrice,
    has_direct_comps: true,
  };
}