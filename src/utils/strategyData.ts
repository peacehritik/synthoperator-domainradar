import type { DomainStrategyType, StrategyWeights } from '../types';

export interface StrategyHubMetadata {
  type: DomainStrategyType;
  slug: string;
  name: string;
  subtitle: string;
  description: string;
  appliedWeights: StrategyWeights;
  holdingHorizon: string;
  liquidityScore: string;
  typicalTargetBuyer: string;
  examplePatterns: string[];
  keyAdvantages: string[];
  commonRisks: string[];
  associatedSales: {
    domain: string;
    price_usd: number;
    date: string;
    venue: string;
  }[];
}

export const STRATEGY_HUBS_DATABASE: Record<string, StrategyHubMetadata> = {
  brandable: {
    type: 'brandable',
    slug: 'brandable',
    name: 'Brandable Startup Archetype',
    subtitle: 'Invented phonetic naming with high distinctiveness and enterprise appeal.',
    description: 'Coined, modern alphanumeric names typically between 4 and 8 characters with zero dictionary collision. Highly favored by venture-backed startups for clean global trademark registration and universal category expansion.',
    appliedWeights: {
      brandability: 0.35,
      memorability: 0.25,
      liquidity: 0.15,
      tld_equity: 0.15,
      commercial_search: 0.05,
      economics_spread: 0.05,
    },
    holdingHorizon: '12 - 36 months (Patient Hold)',
    liquidityScore: 'Selective End-User Liquidity',
    typicalTargetBuyer: 'Series A/B VC-backed startups, technology founders, DTC product launches.',
    examplePatterns: ['Xavo.com', 'Miro.com', 'Nexvo.com', 'Lumo.com', 'Zola.com'],
    keyAdvantages: [
      'High trademark distinctiveness with minimal infringement risk.',
      'Sought after by high-capital startups willing to pay premium valuations.',
      'Fluid phonetic recall across international markets.',
    ],
    commonRisks: [
      'Zero baseline organic search volume before brand awareness.',
      'Requires patient holding timeframes before finding an exact-match buyer.',
    ],
    associatedSales: [
      { domain: 'mogul.com', price_usd: 1300000, date: '2026', venue: 'LegalBrandMarketing' },
      { domain: 'koko.com', price_usd: 1000000, date: '2024', venue: 'Atom.com' },
      { domain: 'highlevel.com', price_usd: 1000000, date: '2026', venue: 'Private Brokerage' },
      { domain: 'stan.com', price_usd: 750000, date: '2026', venue: 'GetYourDomain' },
      { domain: 'twig.com', price_usd: 695000, date: '2026', venue: 'ApexMoon.com' },
      { domain: 'zano.com', price_usd: 500000, date: '2026', venue: 'Atom.com' },
      { domain: 'owen.com', price_usd: 420000, date: '2024', venue: 'GoDaddy' },
      { domain: 'evan.com', price_usd: 400000, date: '2026', venue: 'LegalBrandMarketing' },
      { domain: 'amos.com', price_usd: 365000, date: '2026', venue: 'K-Ventures' },
      { domain: 'miro.com', price_usd: 45000, date: '2019', venue: 'Private Brokerage' },
      { domain: 'velo.com', price_usd: 50000, date: '2020', venue: 'GoDaddy Auctions' },
      { domain: 'zola.com', price_usd: 42000, date: '2018', venue: 'Sedo' },
    ],
  },
  exact_match_keyword: {
    type: 'exact_match_keyword',
    slug: 'exact-match-keyword',
    name: 'Exact Match Keyword Archetype',
    subtitle: 'Commercial dictionary words with proven search intent and category authority.',
    description: 'Natural language words or high-commercial keyword combinations representing direct goods, financial instruments, or software solutions. Driven by organic search volume and high commercial CPC advertiser demand.',
    appliedWeights: {
      commercial_search: 0.35,
      liquidity: 0.25,
      economics_spread: 0.15,
      tld_equity: 0.15,
      brandability: 0.05,
      memorability: 0.05,
    },
    holdingHorizon: '6 - 24 months (High Turnover)',
    liquidityScore: 'Broad Investor & Commercial Liquidity',
    typicalTargetBuyer: 'E-commerce aggregators, affiliate operators, established industry incumbents.',
    examplePatterns: ['Rocket.com', 'Gold.com', 'Green.com', 'Workspace.com', 'Shift.com'],
    keyAdvantages: [
      'Instant intuitive comprehension and organic type-in traffic demand.',
      'Direct advertiser CPC and SEO authority out of the box.',
      'Active investor bidding floor on secondary domain auctions.',
    ],
    commonRisks: [
      'Dictionary words can face generic dilution if not coupled with strong TLD.',
      'Higher baseline acquisition cost on competitive drop auctions.',
    ],
    associatedSales: [
      { domain: 'rocket.com', price_usd: 14000000, date: '2024', venue: 'Hilco Digital Assets' },
      { domain: 'gold.com', price_usd: 8515000, date: '2024', venue: 'Hilco Digital Assets' },
      { domain: 'green.com', price_usd: 7500000, date: '2026', venue: 'Hilco Digital Assets' },
      { domain: 'help.com', price_usd: 3000000, date: '2023', venue: 'Above.com' },
      { domain: 'workspace.com', price_usd: 1450000, date: '2026', venue: 'Coogan.au' },
      { domain: 'shift.com', price_usd: 1365000, date: '2024', venue: 'Hilco Streambank' },
      { domain: 'midnight.com', price_usd: 1150000, date: '2026', venue: 'Sedo' },
      { domain: 'recovery.com', price_usd: 935000, date: '2023', venue: 'Atom.com' },
      { domain: 'rural.com', price_usd: 550000, date: '2024', venue: 'GetYourDomain' },
      { domain: 'continue.com', price_usd: 550000, date: '2024', venue: 'LegalBrandMarketing' },
      { domain: 'bagels.com', price_usd: 500000, date: '2024', venue: 'Sedo' },
      { domain: 'delete.com', price_usd: 494352, date: '2026', venue: 'GoDaddy' },
    ],
  },
  geo_service: {
    type: 'geo_service',
    slug: 'geo-service',
    name: 'Geo Local Service Archetype',
    subtitle: 'Regional geographic markers paired with essential trade or logistics services.',
    description: 'Combines a specific metropolitan area, region, or country identifier with a high-intent local trade. Highly effective for local lead generation, national shipping logistics, and contractor customer acquisition.',
    appliedWeights: {
      commercial_search: 0.35,
      economics_spread: 0.25,
      tld_equity: 0.20,
      liquidity: 0.10,
      brandability: 0.05,
      memorability: 0.05,
    },
    holdingHorizon: '3 - 18 months (Targeted Outbound)',
    liquidityScore: 'Focused End-User Trade Liquidity',
    typicalTargetBuyer: 'Regional HVAC/plumbing contractors, legal firms, local courier services, multi-location agencies.',
    examplePatterns: ['MiamiPlumber.com', 'CasaCourier.ma', 'ParisCourier.com', 'NYCTours.com'],
    keyAdvantages: [
      'Very high conversion rate from localized search queries.',
      'Ideal for active outbound marketing to established regional businesses.',
      'Strong fit with national country-code extensions (.fr, .ma, .es, .de, .uk).',
    ],
    commonRisks: [
      'Restricted to regional buyers within that specific geographic territory.',
      'Lower wholesale investor liquidity compared to global .com brandables.',
    ],
    associatedSales: [
      { domain: 'miamiplumber.com', price_usd: 4500, date: '2020', venue: 'GoDaddy Auctions' },
      { domain: 'pariscourier.com', price_usd: 3200, date: '2021', venue: 'Sedo' },
      { domain: 'casacourier.com', price_usd: 2400, date: '2021', venue: 'Sedo' },
      { domain: 'casaship.com', price_usd: 1800, date: '2022', venue: 'GoDaddy Auctions' },
    ],
  },
  short_acronym_numeric: {
    type: 'short_acronym_numeric',
    slug: 'short-acronym-numeric',
    name: 'Short Acronym & Numeric Archetype',
    subtitle: 'Ultra-short 2 to 4 character combinations with established floor liquidity.',
    description: 'Two to four letter acronyms (LLLL, LLL, LL) and numeric domains. Considered the blue-chip asset class of domain investing due to limited mathematical supply and strong institutional investor demand.',
    appliedWeights: {
      liquidity: 0.40,
      tld_equity: 0.25,
      economics_spread: 0.20,
      brandability: 0.10,
      memorability: 0.05,
      commercial_search: 0.00,
    },
    holdingHorizon: 'Instant Auction Liquidity to Long-Term Store of Value',
    liquidityScore: 'Elite Institutional Floor Liquidity',
    typicalTargetBuyer: 'Global conglomerates, cross-border trade, crypto protocols, high-net-worth investors.',
    examplePatterns: ['AI.com', 'NAS.com', 'Max.com', 'TP.com', 'Mom.com', 'GLD.com'],
    keyAdvantages: [
      'Guaranteed floor liquidation price in domain investor auctions.',
      'Zero verbal friction and maximum mobile typing speed.',
      'Finite mathematical supply ensuring long-term value preservation.',
    ],
    commonRisks: [
      'High capital outlay required to enter the tier.',
      'Requires verified provenance to safeguard against stolen registry records.',
    ],
    associatedSales: [
      { domain: 'ai.com', price_usd: 70000000, date: '2025', venue: 'GetYourDomain / DNJournal' },
      { domain: 'club.com', price_usd: 10000000, date: '2025', venue: 'ATM Holdings / DNJournal' },
      { domain: 'pay.com', price_usd: 3400000, date: '2020', venue: 'Private Brokerage' },
      { domain: 'max.com', price_usd: 1800000, date: '2023', venue: 'NameExperts' },
      { domain: 'nas.com', price_usd: 1250000, date: '2026', venue: 'Lumis / DNJournal' },
      { domain: 'tp.com', price_usd: 1200000, date: '2024', venue: 'Afternic' },
      { domain: 'mom.com', price_usd: 1100000, date: '2026', venue: 'Hilco Digital' },
      { domain: 'gld.com', price_usd: 1000000, date: '2023', venue: 'Private Brokerage' },
      { domain: 'derm.com', price_usd: 825000, date: '2026', venue: 'QEIP.com' },
      { domain: 'zen.com', price_usd: 575000, date: '2020', venue: 'Sedo' },
      { domain: 'txt.com', price_usd: 502250, date: '2026', venue: 'fruits.co / DNJournal' },
      { domain: 'pub.com', price_usd: 500000, date: '2026', venue: 'Defining.com' },
    ],
  },
  tech_trend: {
    type: 'tech_trend',
    slug: 'tech-trend',
    name: 'Tech Trend & AI Archetype',
    subtitle: 'Emerging technology terminology and AI ecosystem naming patterns.',
    description: 'Domains incorporating trending technology terminology (AI, Agent, Neural, Flow, Compute, Cloud, Dev) or utilizing modern developer-focused extensions (.ai, .io, .dev). Driven by venture capital cycles and technology adoption.',
    appliedWeights: {
      memorability: 0.30,
      brandability: 0.25,
      liquidity: 0.20,
      commercial_search: 0.15,
      tld_equity: 0.10,
      economics_spread: 0.00,
    },
    holdingHorizon: '6 - 24 months (Tech Cycle Driven)',
    liquidityScore: 'High Venture & Startup Liquidity',
    typicalTargetBuyer: 'AI research labs, venture-backed tech startups, developer tooling platforms.',
    examplePatterns: ['AI.com', 'Bot.ai', 'Wisdom.ai', 'You.ai', 'Cloud.ai', 'Genesis.ai'],
    keyAdvantages: [
      'Instant market positioning at the frontier of technology trends.',
      'High venture capital willingness to pay for category leadership.',
      'Strong synergy with .ai and .io modern extensions.',
    ],
    commonRisks: [
      'Higher annual carrying fees on .ai extensions ($80/year vs $14/year).',
      'Technology terminology can evolve rapidly over multi-year cycles.',
    ],
    associatedSales: [
      { domain: 'ai.com', price_usd: 70000000, date: '2025', venue: 'GetYourDomain / DNJournal' },
      { domain: 'bot.ai', price_usd: 1200000, date: '2026', venue: 'Sedo / DNJournal' },
      { domain: 'wisdom.ai', price_usd: 750000, date: '2025', venue: 'DNJournal' },
      { domain: 'you.ai', price_usd: 700000, date: '2023', venue: 'Sedo' },
      { domain: 'cloud.ai', price_usd: 600000, date: '2025', venue: 'DNJournal' },
      { domain: 'genesis.ai', price_usd: 400000, date: '2026', venue: 'Atom.com' },
      { domain: 'cursor.com', price_usd: 399000, date: '2024', venue: 'Private Brokerage' },
      { domain: 'law.ai', price_usd: 350000, date: '2025', venue: 'DNJournal' },
      { domain: 'free.ai', price_usd: 350000, date: '2026', venue: 'Atom.com' },
      { domain: 'rush.ai', price_usd: 300000, date: '2025', venue: 'DNJournal' },
      { domain: 'neo.ai', price_usd: 275000, date: '2026', venue: 'Private Brokerage' },
      { domain: 'girlfriend.ai', price_usd: 274610, date: '2024', venue: 'Atom.com' },
      { domain: 'privatellm.com', price_usd: 250000, date: '2026', venue: 'Afternic' },
      { domain: 'sim.ai', price_usd: 220000, date: '2025', venue: 'DNJournal' },
      { domain: 'source.ai', price_usd: 200000, date: '2026', venue: 'fruits.co / DNJournal' },
      { domain: 'rank.ai', price_usd: 200000, date: '2025', venue: 'DNJournal' },
      { domain: 'zip.ai', price_usd: 200000, date: '2025', venue: 'Afternic' },
      { domain: 'thunder.io', price_usd: 179995, date: '2026', venue: 'Afternic' },
      { domain: 'turbo.ai', price_usd: 165000, date: '2025', venue: 'Namecheap' },
      { domain: 'leo.ai', price_usd: 150000, date: '2025', venue: 'Atom.com' },
    ],
  },
};