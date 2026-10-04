/**
 * Canonical Domain Intelligence Glossary & Protected Terminology Reference
 * Ensures protected technical terms, protocols, metrics, and industry registries
 * remain uncorrupted and properly preserved across all 5 localization targets.
 */

export interface ProtectedTermRule {
  term: string;
  category: 'protocol' | 'metric' | 'financial' | 'engine' | 'venue';
  caseSensitive: boolean;
  description: string;
}

export const PROTECTED_DOMAIN_TERMS: ProtectedTermRule[] = [
  // Protocols & Web Infrastructure
  { term: 'RDAP', category: 'protocol', caseSensitive: true, description: 'Registration Data Access Protocol' },
  { term: 'WHOIS', category: 'protocol', caseSensitive: true, description: 'ICANN Whois Protocol' },
  { term: 'DNS', category: 'protocol', caseSensitive: true, description: 'Domain Name System' },
  { term: 'MX', category: 'protocol', caseSensitive: true, description: 'Mail Exchange Record' },
  { term: 'TLD', category: 'protocol', caseSensitive: true, description: 'Top-Level Domain' },
  { term: 'SLD', category: 'protocol', caseSensitive: true, description: 'Second-Level Domain' },
  { term: 'Wayback CDX', category: 'protocol', caseSensitive: false, description: 'Internet Archive CDX Index' },
  { term: 'SHA-256', category: 'protocol', caseSensitive: true, description: 'Cryptographic State Hash' },
  { term: 'TTL', category: 'protocol', caseSensitive: true, description: 'Time To Live Cache' },
  { term: 'CVCV', category: 'protocol', caseSensitive: true, description: 'Consonant-Vowel Phonetic Pattern' },

  // Financial & Decision Metrics
  { term: 'Net EV', category: 'financial', caseSensitive: true, description: 'Net Actuarial Expected Value' },
  { term: 'ROI', category: 'financial', caseSensitive: true, description: 'Return on Investment' },
  { term: 'CPM', category: 'metric', caseSensitive: true, description: 'Cost Per Mille' },
  { term: 'CPC', category: 'metric', caseSensitive: true, description: 'Cost Per Click' },
  { term: 'MAPE', category: 'metric', caseSensitive: true, description: 'Mean Absolute Percentage Error' },

  // Decision Engines & Venues
  { term: 'TypeSafe JEV', category: 'engine', caseSensitive: false, description: 'TypeSafe AI Decision Engine' },
  { term: 'System One', category: 'engine', caseSensitive: false, description: 'JEV System One Architecture' },
  { term: 'Sedo', category: 'venue', caseSensitive: true, description: 'Domain Marketplace' },
  { term: 'GoDaddy', category: 'venue', caseSensitive: true, description: 'Registrar & Auctions' },
  { term: 'NameJet', category: 'venue', caseSensitive: true, description: 'Expired Domain Auctions' },
  { term: 'DropCatch', category: 'venue', caseSensitive: true, description: 'Domain Backorder Service' },
  { term: 'Dynadot', category: 'venue', caseSensitive: true, description: 'Domain Registrar & Marketplace' },
];

/**
 * Checks if a string contains any protected term
 */
export function containsProtectedTerm(text: string, term: string, caseSensitive = false): boolean {
  if (caseSensitive) {
    return text.includes(term);
  }
  return text.toLowerCase().includes(term.toLowerCase());
}

/**
 * Validates whether translated JSON preserves protected terminology
 */
export function validateGlossaryIntegrity(
  sourceText: string,
  translatedText: string
): { compliant: boolean; missingTerms: string[] } {
  const missingTerms: string[] = [];

  for (const rule of PROTECTED_DOMAIN_TERMS) {
    const isPresentInSource = containsProtectedTerm(sourceText, rule.term, rule.caseSensitive);
    if (isPresentInSource) {
      const isPresentInTranslation = containsProtectedTerm(translatedText, rule.term, false);
      if (!isPresentInTranslation) {
        missingTerms.push(rule.term);
      }
    }
  }

  return {
    compliant: missingTerms.length === 0,
    missingTerms,
  };
}