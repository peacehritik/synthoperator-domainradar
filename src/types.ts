export type SupportedLanguage = 'en' | 'fr' | 'es' | 'pt' | 'ar';

export type DataStatus = 'observed' | 'derived' | 'estimated' | 'unknown' | 'failed';

export type SourceType = 'official' | 'first_party' | 'commercial' | 'public' | 'user' | 'internal' | 'unobserved';

export interface Evidence<T> {
  value: T | null;
  status: DataStatus;
  source: SourceType;
  sourceLabel: string;
  retrievedAt?: string;
  confidence?: number;
  methodology?: string;
}

export type DecisionMode = 'buy' | 'renew' | 'brand_selection' | 'renewal';

export interface ExtensionInfo {
  tld: string;
  tier: 'Tier 1' | 'Tier 2' | 'Tier 3' | 'Tier 4';
  tierMultiplier: number;
  annualRenewalCost: number;
  credibility: 'High' | 'Strong' | 'Moderate' | 'Niche';
}

export interface PriceRange {
  low: number;
  high: number;
  midpoint: number;
}

export type AcquisitionPricingStatus = 'available_registry' | 'user_specified' | 'unknown_aftermarket';

export interface EconomicValuationResult {
  wholesale_range: PriceRange;
  retail_range: PriceRange;
  estimated_annual_sale_probability_pct: number; // P_sale: 2% to 25%
  gross_expected_value_usd: number; // (retail_midpoint * P_sale)
  acquisition_cost_usd: number | null;
  acquisition_status: AcquisitionPricingStatus;
  estimated_transaction_fees_usd: number; // Broker & platform fees (15%)
  estimated_carrying_cost_usd: number; // 2 years registry renewals
  net_actuarial_expected_value_usd: number | null; // Net Expected Value (null if price unknown)
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

export interface UserManualEvidenceOverrides {
  exact_search_volume?: number | null;
  cpc_usd?: number | null;
  backlinks_count?: number | null;
  referring_domains?: number | null;
  annual_parking_revenue_usd?: number | null;
  inbound_inquiries_12m?: number | null;
  custom_asking_price_usd?: number | null;
}

export interface WaybackEvidence {
  snapshot_count: number;
  first_seen_year: number | null;
  last_seen_year: number | null;
  has_historical_snapshots: boolean;
  source: 'wayback_cdx_public';
}

export interface GoogleSuggestEvidence {
  suggestion_count: number;
  top_suggestions: string[];
  has_commercial_intent_tokens: boolean;
  source: 'google_suggest_open';
}

export interface WikipediaEvidence {
  is_encyclopedic_term: boolean;
  search_hit_count: number;
  source: 'wikipedia_api_open';
}

export interface DnsEvidence {
  is_resolving: boolean;
  has_mx_mail_records: boolean;
  nameservers: string[];
  source: 'node_dns_native';
}

export interface TrademarkScanEvidence {
  trademark_collision_risk: 'clear' | 'low' | 'high';
  matched_brand_name: string | null;
  match_type: 'exact' | 'typosquat' | 'substring' | 'none';
  source: 'local_famous_brands_index';
}

export interface FreeEvidenceReport {
  domain: string;
  sld: string;
  wayback: WaybackEvidence;
  googleSuggest: GoogleSuggestEvidence;
  wikipedia: WikipediaEvidence;
  dns: DnsEvidence;
  trademarkScan: TrademarkScanEvidence;
  latencyMs: number;
}

export interface MetricSourceTag {
  value: number | string | boolean | null;
  source: 
    | 'user_verified_manual'
    | 'wayback_cdx_public'
    | 'google_suggest_open'
    | 'wikipedia_api_open'
    | 'node_dns_native'
    | 'local_famous_brands_index'
    | 'rdap_registry'
    | 'deterministic_heuristic'
    | 'unobserved';
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
  comparable_sales?: ComparableSaleMatch[];
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
  sources?: Record<string, MetricSourceTag>;
}

export interface EvidenceCoverageReport {
  coverage_pct: number; // Commercial Decision Diligence Coverage
  telemetry_coverage_pct?: number; // Total Observed Telemetry Coverage
  verified_fields: string[];
  unknown_fields: string[];
  free_signals_count?: number;
  manual_overrides_count?: number;
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

export interface JEVChoiceAnswer<T = string> {
  choice: T;
  confidence: number;
  probabilities?: Record<string, number>;
}

export interface JEVNoulAnswer {
  value: number;
  confidence?: number;
}

export interface JEVScoreAnswer {
  score: number;
  confidence?: number;
  normalizedPercentage: number;
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

export type BusinessPriority =
  | 'brand_first'
  | 'trust_first'
  | 'budget_first'
  | 'global_first'
  | 'seo_first';

export interface BusinessContext {
  business_name: string;
  business_type: 'saas' | 'startup' | 'ecommerce' | 'agency' | 'creator' | 'newsletter' | 'product' | 'other';
  industry: string;
  target_market: 'global_us_eu' | 'us_only' | 'eu_only' | 'local_national';
  target_audience: 'b2b_enterprises' | 'b2b_smb' | 'b2c_consumers' | 'creators_developers';
  brand_tone: ('professional' | 'innovative' | 'playful' | 'minimal' | 'luxury')[];
  primary_priority: BusinessPriority;
  max_budget_usd?: number | null;
}

export interface CandidateEvaluationResult {
  domain: string;
  rank: number;
  status: 'recommended' | 'strong_alternative' | 'viable_budget' | 'avoid_risk';
  business_fit_score: number;
  brand_strength_score: number;
  trust_tld_score: number;
  risk_score: number;
  economics_score: number;
  composite_decision_score: number;
  jev_confidence: number;
  evidence_coverage: number;
  why_recommended_points: string[];
  why_not_this_domain_points: string[];
  hard_risk_triggered: boolean;
  trademark_legal_status: string;
  valuation?: DomainValuation;
  rdap?: any;
  free_evidence?: FreeEvidenceReport;
  jevAnswers?: ModeCJevAnswers;
  version_trace?: AuditVersionTrace;
  rawJevPayload?: {
    model: string;
    state: Record<string, any>;
    questions: Record<string, any>;
  };
  rawJevResponse?: Record<string, any>;
  latencyMs?: number;
}

export interface ComparativeDecisionReport {
  business: BusinessContext;
  candidates_count: number;
  recommended_option: CandidateEvaluationResult;
  alternatives: CandidateEvaluationResult[];
  comparative_matrix_columns: string[];
  cross_domain_tradeoffs: {
    domain: string;
    tradeoff_summary: string;
  }[];
  unobserved_gaps: string[];
  timestamp?: string;
  version_trace?: AuditVersionTrace;
}

export interface JEVResponse {
  model: 'jev-latest' | string;
  source: 'api.typesafe.ai' | 'jev-engine-fallback';
  latencyMs: number;
  missingApiKey?: boolean;
  confidence?: number;
  mode?: DecisionMode;
  rawJevPayload?: {
    model: string;
    state: Record<string, any>;
    questions: Record<string, any>;
  };
  rawJevResponse?: Record<string, any>;
  modeAAnswers?: ModeAJevAnswers;
  modeBAnswers?: ModeBJevAnswers;
  modeCAnswers?: ModeCJevAnswers;
  answers: Record<string, any>;
  trademark_risk_flagged?: boolean;
  trademark_override_applied?: boolean;
  upstream_error?: {
    status: number;
    message: string;
    reason: string;
  };
}

export interface EvidenceBreakdown {
  dataQualityPct: number;
  telemetryQualityPct?: number;
  jevConfidence: number;
  compositeScore: number;
  hardGateTriggered: string | null;
  statusLabel: string;
  verifiedPros: string[];
  verifiedCons: string[];
  coverageReport?: EvidenceCoverageReport;
  metricsEvidence?: DomainMetricsEvidence;
  strategyProfile?: StrategyProfileResult;
  scoreBreakdown?: {
    brandabilityComponent: number;
    memorabilityComponent: number;
    commercialSearchComponent?: number;
    liquidityComponent: number;
    tldEquityComponent: number;
    economicsComponent: number;
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
  final_override_verdict: string | null;
}

export interface EvidenceSignal {
  id: string;
  label: string;
  source: string;
  impact: 'high' | 'medium' | 'low';
}

export interface NextActionItem {
  id: string;
  action: string;
  target_dimension: string;
  priority: 'critical' | 'recommended' | 'optional';
  suggested_tool_or_source: string;
}

export interface ExplainabilityReport {
  bull_signals: EvidenceSignal[];
  bear_signals: EvidenceSignal[];
  unknown_signals: EvidenceSignal[];
  next_actions: NextActionItem[];
}

export interface AuditVersionTrace {
  engine_version: string;
  question_set_version: string;
  model: string;
  state_hash: string;
  timestamp: string;
  cache_hit: boolean;
  cache_ttl_seconds_remaining?: number;
  latency_ms: number;
  execution_source: 'primary_jev_api' | 'cached_trace' | 'local_contract_fallback';
  canonical_state_json?: string;
  cache_expires_at?: string;
  upstream_error?: {
    status: number;
    message: string;
    reason: string;
  };
}

export interface AuditRequestOptions {
  domain: string;
  mode?: DecisionMode;
  renewalCost?: number;
  annualParkingRevenue?: number;
  inboundOffers?: number;
  holdingYears?: number;
  monthlyImpressions?: number;
  force_refresh?: boolean;
  manual_overrides?: UserManualEvidenceOverrides;
  custom_weights?: StrategyWeights;
}

export interface BuyDecisionResult {
  domain: string;
  score: number;
  compositeScore: number;
  verdict: 'Buy' | 'Review' | 'Pass';
  statusLabel?: string;
  headline: string;
  summary: string;
  bannerClass: string;
  valuation: DomainValuation;
  rdap: RDAPResult;
  jev?: JEVResponse;
  evidence?: EvidenceBreakdown;
  strategy_profile?: StrategyProfileResult;
  economic_valuation?: EconomicValuationResult;
  risk_evaluation?: RiskEngineResult;
  explainability?: ExplainabilityReport;
  version_trace?: AuditVersionTrace;
  free_evidence?: FreeEvidenceReport;
}

export interface RenewalDecisionResult {
  domain: string;
  score: number;
  compositeScore: number;
  verdict: 'Renew' | 'Review' | 'Drop';
  statusLabel?: string;
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
  evidence?: EvidenceBreakdown;
  strategy_profile?: StrategyProfileResult;
  economic_valuation?: EconomicValuationResult;
  holding_efficiency?: HoldingEfficiencyResult;
  risk_evaluation?: RiskEngineResult;
  explainability?: ExplainabilityReport;
  version_trace?: AuditVersionTrace;
  free_evidence?: FreeEvidenceReport;
}

export interface DomainAIAnalysis {
  acquisition_viability_score: number;
  renewal_efficiency_score: number;
  ai_verdict: string;
  key_pros: string[];
  key_risks: string[];
  strategic_recommendation: string;
  suggested_niche: string;
}

export interface DomainAuditResult {
  domain: string;
  mode: DecisionMode;
  buyDecision?: BuyDecisionResult | null;
  renewalDecision?: RenewalDecisionResult | null;
  valuation: DomainValuation;
  rdap: RDAPResult;
  jev?: JEVResponse;
  strategy_profile?: StrategyProfileResult;
  economic_valuation?: EconomicValuationResult;
  holding_efficiency?: HoldingEfficiencyResult;
  risk_evaluation?: RiskEngineResult;
  explainability?: ExplainabilityReport;
  version_trace?: AuditVersionTrace;
  free_evidence?: FreeEvidenceReport;
  manual_overrides?: UserManualEvidenceOverrides;
  force_refresh?: boolean;
  rawJevPayload?: {
    model: string;
    state: Record<string, any>;
    questions: Record<string, any>;
  };
  rawJevResponse?: Record<string, any>;
  latencyMs?: number;
  aiAnalysis?: DomainAIAnalysis | null;
  cached: boolean;
  cachedAt?: string;
  timestamp: string;
}

export type FullAuditResponse = DomainAuditResult;

export interface BulkItemResult {
  domain: string;
  mode: DecisionMode;
  score: number;
  compositeScore?: number;
  verdict: string;
  statusLabel?: string;
  headline: string;
  summary: string;
  bannerClass: string;
  estimatedValue: number;
  annualCarryingCost: number;
  length: number;
  syllables: number;
  tldTier: string;
  brandabilityScore: number;
  strategy_profile?: StrategyProfileResult;
  economic_valuation?: EconomicValuationResult;
  holding_efficiency?: HoldingEfficiencyResult;
  jevChoice?: string;
  jevConfidence?: number;
  jevSource?: string;
  latencyMs?: number;
  rawJevPayload?: {
    model: string;
    state: Record<string, any>;
    questions: Record<string, any>;
  };
  rawJevResponse?: Record<string, any>;
  trademarkRiskScore?: string | number;
  trademarkFlagged?: boolean;
  brandabilityLevel?: string;
  evidence?: EvidenceBreakdown;
  risk_evaluation?: RiskEngineResult;
  explainability?: ExplainabilityReport;
  version_trace?: AuditVersionTrace;
}

export interface WatchlistDomain {
  id: string;
  domain: string;
  addedAt: string;
  mode: DecisionMode;
  verdict: string;
  score: number;
  estimatedValue: number;
  annualCarryingCost: number;
  annualParkingRevenue?: number;
  inboundOffers?: number;
  holdingYears?: number;
  notes?: string;
  strategyProfile?: StrategyProfileResult;
  economicValuation?: EconomicValuationResult;
  holdingEfficiency?: HoldingEfficiencyResult;
  riskEvaluation?: RiskEngineResult;
  explainability?: ExplainabilityReport;
  versionTrace?: AuditVersionTrace;
}

export type OutcomeStatus = 
  | 'holding'
  | 'sold_profitable'
  | 'sold_break_even'
  | 'sold_loss'
  | 'renewed_retained'
  | 'dropped_abandoned';

export interface DomainOutcomeRecord {
  id: string;
  domain: string;
  strategy_type: DomainStrategyType;
  audit_date: string;
  engine_version: string;
  initial_verdict: string;
  initial_score: number;
  initial_ev_usd: number;
  actual_acquisition_price_usd: number;
  outcome_status: OutcomeStatus;
  actual_sale_price_usd: number | null;
  holding_duration_days: number;
  realized_net_pnl_usd: number | null;
  realized_roi_pct: number | null;
  notes?: string;
}

export interface CalibrationMetricsReport {
  total_tracked_assets: number;
  active_holdings_count: number;
  completed_exits_count: number;
  buy_verdict_precision_pct: number;
  renew_verdict_precision_pct: number;
  valuation_error_pct: number;
  total_realized_pnl_usd: number;
  decision_distribution: {
    buy_pct: number;
    review_pct: number;
    pass_pct: number;
    insufficient_pct: number;
  };
  calibration_health: 'healthy' | 'overly_optimistic' | 'overly_conservative';
  tuning_recommendation: string;
}