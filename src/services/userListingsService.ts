import axios from 'axios';

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://api.ctomarketplace.com';

function authHeaders() {
  const token = localStorage.getItem('cto_auth_token');
  if (!token) {
    console.warn('⚠️ No auth token found in localStorage');
    return {
      'Content-Type': 'application/json',
    };
  }
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
}

export interface ScanMetadata {
  token_symbol?: string;
  token_name?: string;
  project_age_days?: number;
  age_display?: string;
  age_display_short?: string;
  creation_date?: string | Date;
  lp_amount_usd?: number;
  token_price?: number;
  volume_24h?: number;
  market_cap?: number;
  pool_count?: number;
  lp_lock_months?: number;
  lp_burned?: boolean;
  lp_locked?: boolean;
  lock_contract?: unknown;
  lock_analysis?: unknown;
  largest_lp_holder?: unknown;
  pair_address?: string;
  scan_timestamp?: string;
  verified?: boolean;
  holder_count?: number;
  creation_transaction?: string;
  distribution_metrics?: unknown;
  whale_analysis?: unknown;
  suspicious_activity_details?: unknown;
  activity_summary?: unknown;
  wallet_activity_data?: unknown;
  smart_contract_security?: unknown;
  vetting_results?: {
    overallScore?: number;
    riskLevel?: string;
    eligibleTier?: string;
    dataSufficient?: boolean;
    missingData?: string[];
    allFlags?: string[];
    componentScores?: {
      distribution?: { score: number; flags: string[] };
      liquidity?: { score: number; flags: string[] };
      devAbandonment?: { score: number; flags: string[] };
      technical?: { score: number; flags: string[] };
    };
    calculatedAt?: string;
  };
}

export interface ScanResultDetails {
  success?: boolean;
  risk_score?: number;
  tier?: string;
  risk_level?: string;
  eligible?: boolean;
  summary?: string;
  metadata?: ScanMetadata;
  vetting_results?: ScanMetadata['vetting_results'];
  id?: string;
  // Nested details structure (details.details)
  details?: ScanResultDetails;
  [key: string]: unknown; // Allow additional properties
}

export interface ScanResult {
  success: boolean;
  risk_score: number;
  tier: string;
  risk_level?: string;
  eligible: boolean;
  summary?: string;
  metadata?: ScanMetadata;
  // Legacy fields for backward compatibility
  vettingScore?: number;
  vettingTier?: string;
  // The actual data is nested in details
  details?: ScanResultDetails;
}

export const userListingsService = {
  /**
   * Scan token for listing eligibility
   * @param contractAddr - Contract address (note: contractAddr, not contractAddress)
   * @param chain - Chain name (note: chain, not network)
   * @returns ScanResult with risk score, tier, and metadata
   */
  async scan(contractAddr: string, chain: string): Promise<ScanResult> {
    // Get auth headers and verify token is present
    const headers = authHeaders();
    const token = localStorage.getItem('cto_auth_token');
    
    if (!token) {
      console.error('❌ No authentication token found. User must be logged in to scan tokens.');
      throw new Error('Authentication required. Please login first.');
    }
    
    console.log('🔍 Scanning token with:', {
      contractAddr,
      chain,
      hasToken: !!token,
      tokenLength: token.length,
    });
    
    // Accept non-2xx statuses (e.g., 400 ineligible) and normalize response so UI can proceed
    const res = await axios.post(
      `${backendUrl}/api/v1/user-listings/scan`,
      { contractAddr, chain },
      { headers, validateStatus: () => true }
    );
    
    // Handle wrapped response from TransformInterceptor
    const responseData = res.data?.data || res.data;
    
    // Force re-auth if unauthorized
    if (res.status === 401) {
      throw new Error('Unauthorized');
    }
    
    if (res.status >= 200 && res.status < 300) {
      // Normalize response to match our interface
      return {
        success: true,
        risk_score: responseData?.risk_score ?? 0,
        tier: responseData?.tier ?? 'UNQUALIFIED',
        risk_level: responseData?.risk_level,
        eligible: responseData?.eligible ?? false,
        summary: responseData?.summary,
        metadata: responseData?.metadata,
        // Legacy fields for backward compatibility
        vettingScore: responseData?.risk_score ?? responseData?.vettingScore ?? 0,
        vettingTier: responseData?.tier ?? responseData?.vettingTier ?? 'UNQUALIFIED',
        details: responseData,
      } as ScanResult;
    }
    
    // For structured backend errors (HttpException with metadata), preserve details
    if (responseData && (responseData.metadata || typeof responseData.risk_score !== 'undefined')) {
      return {
        success: false,
        risk_score: responseData?.risk_score ?? 0,
        tier: responseData?.tier ?? 'UNQUALIFIED',
        risk_level: responseData?.risk_level,
        eligible: responseData?.eligible ?? false,
        summary: responseData?.summary,
        metadata: responseData?.metadata,
        // Legacy fields
        vettingScore: responseData?.risk_score ?? 0,
        vettingTier: responseData?.tier ?? 'UNQUALIFIED',
        details: responseData,
      } as ScanResult;
    }
    
    // Fallback normalization
    const message = (responseData && (responseData.message || responseData.error)) ||
      'Token does not meet minimum criteria for any tier';
    return {
      success: false,
      risk_score: responseData?.risk_score ?? 0,
      tier: responseData?.tier ?? 'UNQUALIFIED',
      eligible: false,
      // Legacy fields
      vettingScore: responseData?.risk_score ?? 0,
      vettingTier: responseData?.tier ?? 'UNQUALIFIED',
      details: { 
        success: false,
        risk_score: responseData?.risk_score ?? 0,
        tier: responseData?.tier ?? 'UNQUALIFIED',
        eligible: false,
        message, 
        status: res.status, 
        raw: responseData 
      } as ScanResultDetails,
    } as ScanResult;
  },

  /**
   * Create a new user listing
   * @param payload - Listing data including contract address, chain, title, description, etc.
   * @returns Created listing data with ID
   */
  async create(payload: {
    contractAddr: string;
    chain: string;
    title: string;
    description: string;
    bio?: string;
    logoUrl?: string;
    bannerUrl?: string;
    links?: {
      website?: string;
      twitter?: string;
      telegram?: string;
      discord?: string;
      [key: string]: string | undefined;
    };
    vettingTier: string;
    vettingScore: number;
  }) {
    const res = await axios.post(
      `${backendUrl}/api/v1/user-listings`,
      payload,
      { headers: authHeaders() }
    );
    // Handle wrapped response from TransformInterceptor
    const responseData = res.data?.data || res.data;
    return responseData;
  },
};
