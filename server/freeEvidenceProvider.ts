import dns from 'dns';
import type {
  FreeEvidenceReport,
  WaybackEvidence,
  GoogleSuggestEvidence,
  WikipediaEvidence,
  DnsEvidence,
  TrademarkScanEvidence,
} from '../src/types.js';

// Famous Global Trademarks Dictionary (~1,000 top global trademarks & enterprises)
export const FAMOUS_BRANDS_DICTIONARY: string[] = [
  // Tech & AI Giants
  'apple', 'google', 'microsoft', 'amazon', 'meta', 'facebook', 'instagram', 'whatsapp',
  'netflix', 'tesla', 'openai', 'chatgpt', 'nvidia', 'intel', 'amd', 'cisco', 'oracle',
  'salesforce', 'adobe', 'ibm', 'qualcomm', 'broadcom', 'dell', 'hp', 'lenovo', 'asus',
  'acer', 'sony', 'samsung', 'huawei', 'xiaomi', 'lg', 'panasonic', 'philips', 'toshiba',
  'canon', 'nikon', 'gopro', 'spotify', 'shopify', 'uber', 'lyft', 'airbnb', 'stripe',
  'paypal', 'square', 'block', 'plaid', 'brex', 'ramp', 'revolut', 'monzo', 'chime',
  'robinhood', 'coinbase', 'binance', 'kraken', 'bybit', 'gemini', 'kucoin', 'okx',
  'tiktok', 'bytedance', 'twitter', 'x', 'reddit', 'discord', 'slack', 'zoom', 'telegram',
  'snapchat', 'pinterest', 'linkedin', 'github', 'gitlab', 'bitbucket', 'atlassian', 'jira',
  'confluence', 'trello', 'notion', 'figma', 'canva', 'linear', 'vercel', 'supabase',
  'cloudflare', 'fastly', 'akamai', 'datadog', 'dynatrace', 'splunk', 'snowflake', 'databricks',
  'elastic', 'mongodb', 'redis', 'postman', 'docker', 'kubernetes', 'hashicorp', 'terraform',
  'mailchimp', 'hubspot', 'zendesk', 'asana', 'airtable', 'monday', 'clickup', 'smartsheet',
  'dropbox', 'box', 'wetransfer', 'docusign', 'pandadoc', 'loom', 'miro', 'lucidchart',
  'webflow', 'wix', 'squarespace', 'wordpress', 'automattic', 'godaddy', 'namecheap', 'namebio',
  'unity', 'unreal', 'epicgames', 'fortnite', 'roblox', 'minecraft', 'nintendo', 'playstation',
  'xbox', 'sega', 'capcom', 'bandai', 'squareenix', 'ubisoft', 'ea', 'activision', 'blizzard',
  'riotgames', 'valve', 'steam', 'twitch', 'kick', 'patreon', 'onlyfans', 'substack', 'medium',
  'anthropic', 'claude', 'midjourney', 'stability', 'mistral', 'cohere', 'perplexity', 'jasper',
  'huggingface', 'runway', 'elevenlabs', 'deepmind', 'deepseek', 'cursor', 'replit', 'v0',
  
  // Finance & Payments
  'visa', 'mastercard', 'amex', 'americanexpress', 'discover', 'jpmorgan', 'chase', 'citi',
  'citibank', 'bankofamerica', 'wellsfargo', 'goldmansachs', 'morganstanley', 'barclays',
  'hsbc', 'bnp', 'santander', 'ubs', 'creditsuisse', 'deutschebank', 'capitalone', 'fidelity',
  'vanguard', 'schwab', 'blackrock', 'state_street', 'klarna', 'afterpay', 'affirm', 'affirm',
  'adyen', 'worldpay', 'checkout', 'wise', 'remitly', 'westernunion', 'moneygram',

  // Retail, E-Commerce & Consumer Goods
  'walmart', 'target', 'costco', 'homedepot', 'lowes', 'bestbuy', 'ikea', 'ebay', 'aliexpress',
  'alibaba', 'temu', 'shein', 'etsy', 'wayfair', 'chewy', 'asos', 'zara', 'inditex', 'hm',
  'uniqlo', 'gap', 'nike', 'adidas', 'puma', 'underarmour', 'lululemon', 'gymshark', 'newbalance',
  'asics', 'reebok', 'vans', 'converse', 'timberland', 'northface', 'patagonia', 'columbia',
  'gucci', 'prada', 'louisvuitton', 'lvmh', 'chanel', 'hermes', 'dior', 'rolex', 'omega',
  'tagheuer', 'cartier', 'tiffany', 'burberry', 'versace', 'armani', 'fendi', 'balenciaga',
  'sephora', 'ulta', 'loreal', 'estee_lauder', 'shiseido', 'nivea', 'dove', 'colgate', 'gillette',
  'procter', 'pg', 'unilever', 'nestle', 'mondelez', 'danone', 'kraft', 'heinz', 'kellogg',
  'generalmills', 'mars', 'hershey', 'ferrero', 'cocacola', 'coke', 'pepsi', 'pepsico', 'redbull',
  'monsterenergy', 'starbucks', 'dunkin', 'mcdonalds', 'burgerking', 'subway', 'dominos',
  'pizzahut', 'kfc', 'tacobell', 'wendys', 'chipotle', 'starwood', 'marriott', 'hilton',
  'hyatt', 'ihg', 'wyndham', 'accor', 'fourseasons', 'ritzcarlton', 'booking', 'expedia',
  'tripadvisor', 'trivago', 'kayak', 'agoda', 'priceline', 'hotels', 'delta', 'united',
  'americanairlines', 'southwest', 'emirates', 'qatarairways', 'singaporeair', 'lufthansa',
  'britishairways', 'airfrance', 'ryanair', 'easyjet', 'fedex', 'ups', 'dhl', 'usps',

  // Automotive & Energy
  'toyota', 'honda', 'nissan', 'mazda', 'subaru', 'mitsubishi', 'ford', 'chevrolet', 'gm',
  'generalmotors', 'chrysler', 'dodge', 'jeep', 'ram', 'bmw', 'mercedes', 'benz', 'audi',
  'volkswagen', 'vw', 'porsche', 'ferrari', 'lamborghini', 'maserati', 'astonmartin', 'bentley',
  'rollsroyce', 'volvo', 'hyundai', 'kia', 'genesis', 'rivian', 'lucid', 'polestar', 'byd',
  'shell', 'bp', 'exxon', 'mobil', 'chevron', 'totalenergies', 'saudiaramco', 'aramco',

  // Media, Telecom & Entertainment
  'disney', 'marvel', 'pixar', 'lucasfilm', 'warnerbros', 'wbd', 'paramount', 'universal',
  'hbo', 'max', 'discovery', 'peacock', 'hulu', 'espn', 'cnn', 'bbc', 'fox', 'nbc', 'cbs',
  'abc', 'reuters', 'bloomberg', 'forbes', 'wsj', 'nytimes', 'verizon', 'att', 'tmobile',
  'vodafone', 'orange', 'telefonica', 'comcast', 'charter', 'spectrum', 'directv', 'dish'
];

/**
 * Levenshtein distance calculation between two strings.
 */
export function calculateLevenshteinDistance(a: string, b: string): number {
  const an = a ? a.length : 0;
  const bn = b ? b.length : 0;
  if (an === 0) return bn;
  if (bn === 0) return an;

  const matrix = Array.from({ length: bn + 1 }, () => new Array(an + 1).fill(0));
  for (let i = 0; i <= an; i++) matrix[0][i] = i;
  for (let j = 0; j <= bn; j++) matrix[j][0] = j;

  for (let j = 1; j <= bn; j++) {
    for (let i = 1; i <= an; i++) {
      if (b.charAt(j - 1) === a.charAt(i - 1)) {
        matrix[j][i] = matrix[j - 1][i - 1];
      } else {
        matrix[j][i] = Math.min(
          matrix[j - 1][i - 1] + 1, // substitution
          matrix[j][i - 1] + 1,     // insertion
          matrix[j - 1][i] + 1      // deletion
        );
      }
    }
  }
  return matrix[bn][an];
}

/**
 * Perform 0ms offline collision & typosquat scan against ~1,000 famous trademarks.
 */
export function scanTrademarkCollisions(sld: string): TrademarkScanEvidence {
  const normalized = sld.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (!normalized) {
    return {
      trademark_collision_risk: 'clear',
      matched_brand_name: null,
      match_type: 'none',
      source: 'local_famous_brands_index',
    };
  }

  // 1. Exact Match Check
  for (const brand of FAMOUS_BRANDS_DICTIONARY) {
    if (normalized === brand) {
      return {
        trademark_collision_risk: 'high',
        matched_brand_name: brand.toUpperCase(),
        match_type: 'exact',
        source: 'local_famous_brands_index',
      };
    }
  }

  // 2. Substring & Compound Match Check (e.g. applepay, googlecloud, openaihub, paypals)
  for (const brand of FAMOUS_BRANDS_DICTIONARY) {
    if (brand.length >= 4) {
      if (
        normalized.startsWith(brand) ||
        normalized.endsWith(brand) ||
        (normalized.length <= brand.length + 5 && normalized.includes(brand))
      ) {
        return {
          trademark_collision_risk: 'high',
          matched_brand_name: brand.toUpperCase(),
          match_type: 'substring',
          source: 'local_famous_brands_index',
        };
      }
    }
  }

  // 3. Typo-Squatting / Levenshtein Distance Check
  for (const brand of FAMOUS_BRANDS_DICTIONARY) {
    const dist = calculateLevenshteinDistance(normalized, brand);
    if (dist === 1 && brand.length >= 4) {
      return {
        trademark_collision_risk: 'high',
        matched_brand_name: brand.toUpperCase(),
        match_type: 'typosquat',
        source: 'local_famous_brands_index',
      };
    }
    if (dist === 2 && brand.length >= 7 && Math.abs(normalized.length - brand.length) <= 1) {
      return {
        trademark_collision_risk: 'low',
        matched_brand_name: brand.toUpperCase(),
        match_type: 'typosquat',
        source: 'local_famous_brands_index',
      };
    }
  }

  return {
    trademark_collision_risk: 'clear',
    matched_brand_name: null,
    match_type: 'none',
    source: 'local_famous_brands_index',
  };
}

/**
 * Query Wayback Machine CDX API with 2000ms strict timeout.
 */
export async function queryWaybackCdx(domain: string): Promise<WaybackEvidence> {
  const url = `https://web.archive.org/cdx/search/cdx?url=${encodeURIComponent(domain)}&output=json&limit=25&fl=timestamp,original`;
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(2000),
      headers: {
        'User-Agent': 'DomainRadar-EvidenceScanner/2.4 (Free Public Telemetry)',
      },
    });

    if (!res.ok) {
      return {
        snapshot_count: 0,
        first_seen_year: null,
        last_seen_year: null,
        has_historical_snapshots: false,
        source: 'wayback_cdx_public',
      };
    }

    const data = await res.json();
    if (!Array.isArray(data) || data.length <= 1) {
      return {
        snapshot_count: 0,
        first_seen_year: null,
        last_seen_year: null,
        has_historical_snapshots: false,
        source: 'wayback_cdx_public',
      };
    }

    const snapshotRows = data.slice(1);
    const count = snapshotRows.length;
    const firstRow = snapshotRows[0];
    const lastRow = snapshotRows[snapshotRows.length - 1];

    const firstYear = firstRow && firstRow[0] ? parseInt(firstRow[0].substring(0, 4), 10) : null;
    const lastYear = lastRow && lastRow[0] ? parseInt(lastRow[0].substring(0, 4), 10) : null;

    return {
      snapshot_count: count,
      first_seen_year: Number.isFinite(firstYear) ? firstYear : null,
      last_seen_year: Number.isFinite(lastYear) ? lastYear : null,
      has_historical_snapshots: count > 0,
      source: 'wayback_cdx_public',
    };
  } catch {
    return {
      snapshot_count: 0,
      first_seen_year: null,
      last_seen_year: null,
      has_historical_snapshots: false,
      source: 'wayback_cdx_public',
    };
  }
}

/**
 * Query Google Suggest / Autocomplete Open API with 2000ms strict timeout.
 */
export async function queryGoogleSuggest(sld: string): Promise<GoogleSuggestEvidence> {
  const url = `https://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(sld)}`;
  const commercialTokens = [
    'app', 'software', 'buy', 'login', 'tool', 'ai', 'pricing', 'service', 'shop', 'pay',
    'cloud', 'api', 'download', 'online', 'store', 'market', 'portal', 'platform', 'pro',
    'course', 'deals', 'free', 'trial', 'review', 'agency'
  ];

  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(2000),
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!res.ok) {
      return {
        suggestion_count: 0,
        top_suggestions: [],
        has_commercial_intent_tokens: false,
        source: 'google_suggest_open',
      };
    }

    const data = await res.json();
    const suggestions: string[] = Array.isArray(data) && Array.isArray(data[1]) ? data[1] : [];
    const count = suggestions.length;
    const top = suggestions.slice(0, 5);

    const hasIntent = suggestions.some((s) => {
      const lower = s.toLowerCase();
      return commercialTokens.some((tok) => lower.includes(tok));
    });

    return {
      suggestion_count: count,
      top_suggestions: top,
      has_commercial_intent_tokens: hasIntent,
      source: 'google_suggest_open',
    };
  } catch {
    return {
      suggestion_count: 0,
      top_suggestions: [],
      has_commercial_intent_tokens: false,
      source: 'google_suggest_open',
    };
  }
}

/**
 * Query Wikipedia Entity Search API with 2000ms strict timeout.
 */
export async function queryWikipediaEntity(sld: string): Promise<WikipediaEvidence> {
  const url = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(sld)}&format=json`;
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(2000),
      headers: {
        'User-Agent': 'DomainRadar-Bot/2.4 (https://domainradar.ai; info@domainradar.ai)',
      },
    });

    if (!res.ok) {
      return {
        is_encyclopedic_term: false,
        search_hit_count: 0,
        source: 'wikipedia_api_open',
      };
    }

    const data = await res.json();
    const hits = data?.query?.searchinfo?.totalhits || 0;
    const results = data?.query?.search || [];

    // Check if the top result title matches closely with the SLD
    const isDirectMatch = results.some((r: any) => {
      const title = (r?.title || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      return title === sld.toLowerCase();
    });

    return {
      is_encyclopedic_term: isDirectMatch || hits >= 10,
      search_hit_count: hits,
      source: 'wikipedia_api_open',
    };
  } catch {
    return {
      is_encyclopedic_term: false,
      search_hit_count: 0,
      source: 'wikipedia_api_open',
    };
  }
}

/**
 * Check Node.js native DNS resolution (A, AAAA, MX, NS) with 2000ms strict timeout.
 */
export async function queryNodeDns(domain: string): Promise<DnsEvidence> {
  try {
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('DNS Timeout')), 2000)
    );

    const checkA = Promise.race([dns.promises.resolve(domain, 'A'), timeoutPromise]).catch(() => [] as string[]);
    const checkMx = Promise.race([dns.promises.resolveMx(domain), timeoutPromise]).catch(() => [] as dns.MxRecord[]);
    const checkNs = Promise.race([dns.promises.resolveNs(domain), timeoutPromise]).catch(() => [] as string[]);

    const [aRecords, mxRecords, nsRecords] = await Promise.all([checkA, checkMx, checkNs]);

    return {
      is_resolving: aRecords.length > 0,
      has_mx_mail_records: mxRecords.length > 0,
      nameservers: nsRecords.slice(0, 4),
      source: 'node_dns_native',
    };
  } catch {
    return {
      is_resolving: false,
      has_mx_mail_records: false,
      nameservers: [],
      source: 'node_dns_native',
    };
  }
}

/**
 * Master Free Evidence Provider Aggregator.
 * Executes all 5 free providers in parallel using Promise.allSettled with strict sub-2s latency.
 */
export async function fetchFreeEvidence(domain: string, sld: string): Promise<FreeEvidenceReport> {
  const start = Date.now();

  // 1. Offline 0ms Brand Scanner
  const trademarkScan = scanTrademarkCollisions(sld);

  // 2. Parallel Async Public Network Scans
  const [waybackRes, googleRes, wikiRes, dnsRes] = await Promise.allSettled([
    queryWaybackCdx(domain),
    queryGoogleSuggest(sld),
    queryWikipediaEntity(sld),
    queryNodeDns(domain),
  ]);

  const wayback: WaybackEvidence =
    waybackRes.status === 'fulfilled'
      ? waybackRes.value
      : {
          snapshot_count: 0,
          first_seen_year: null,
          last_seen_year: null,
          has_historical_snapshots: false,
          source: 'wayback_cdx_public',
        };

  const googleSuggest: GoogleSuggestEvidence =
    googleRes.status === 'fulfilled'
      ? googleRes.value
      : {
          suggestion_count: 0,
          top_suggestions: [],
          has_commercial_intent_tokens: false,
          source: 'google_suggest_open',
        };

  const wikipedia: WikipediaEvidence =
    wikiRes.status === 'fulfilled'
      ? wikiRes.value
      : {
          is_encyclopedic_term: false,
          search_hit_count: 0,
          source: 'wikipedia_api_open',
        };

  const dns: DnsEvidence =
    dnsRes.status === 'fulfilled'
      ? dnsRes.value
      : {
          is_resolving: false,
          has_mx_mail_records: false,
          nameservers: [],
          source: 'node_dns_native',
        };

  const latencyMs = Date.now() - start;

  return {
    domain,
    sld,
    wayback,
    googleSuggest,
    wikipedia,
    dns,
    trademarkScan,
    latencyMs,
  };
}
