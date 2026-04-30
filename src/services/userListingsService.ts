import axios from 'axios';
import { getAuthToken } from '@/lib/authSession';
import { apiPost, getBackendBaseUrl } from '@/lib/apiClient';
import {
  normalizePresignPayload,
  putFileToPresignedUrl,
} from '@/lib/presignedUpload';

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://api.ctomarketplace.com';

function authHeaders() {
  const token = getAuthToken();
  if (!token) {
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

export interface CreateUserListingPayload {
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
}

export interface ScanResultDetails {
  success?: boolean;
  risk_score?: number;
  tier?: string;
  risk_level?: string;
  eligible?: boolean;
  summary?: string;
  minimum_required_score?: number;
  provisional?: boolean;
  provisional_reason?: string | null;
  provisional_missing_data?: string[];
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
  minimum_required_score?: number;
  provisional?: boolean;
  provisional_reason?: string | null;
  provisional_missing_data?: string[];
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
    // Send request with auth headers if present; let backend return 401 when not authenticated (match cto-test-frontend)
    const headers = authHeaders();

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
  async create(payload: CreateUserListingPayload) {
    const res = await axios.post(
      `${backendUrl}/api/v1/user-listings`,
      payload,
      { headers: authHeaders(), validateStatus: () => true }
    );
    if (res.status >= 200 && res.status < 300) {
      const responseData = res.data?.data || res.data;
      return responseData;
    }
    const errData = res.data?.data ?? res.data;
    const message = errData?.message || res.data?.message || `Request failed with status ${res.status}`;
    const err = new Error(message) as Error & { response?: { data?: unknown }; status?: number };
    err.response = { data: res.data };
    err.status = res.status;
    throw err;
  },
  async update(id: string, payload: Partial<CreateUserListingPayload>) {
    const res = await axios.put(`${backendUrl}/api/v1/user-listings/${id}`, payload, { headers: authHeaders() });
    // Handle wrapped response from TransformInterceptor
    const responseData = res.data?.data || res.data;
    return responseData;
  },
  async publish(id: string) {
    const res = await axios.post(`${backendUrl}/api/v1/user-listings/${id}/publish`, {}, { headers: authHeaders() });
    // Handle wrapped response from TransformInterceptor
    const responseData = res.data?.data || res.data;
    return responseData;
  },
  async mine(signal?: AbortSignal) {
    // Standard path for all user listings
    const res = await axios.get(`${backendUrl}/api/v1/user-listings/mine/all`, {
      headers: authHeaders(),
      signal,
    });
    // Handle wrapped response from TransformInterceptor
    const responseData = res.data?.data || res.data;
    return responseData;
  },
  async listPublic(page = 1, limit = 20) {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    const res = await axios.get(`${backendUrl}/api/v1/user-listings?${params.toString()}`);
    // Handle wrapped response from TransformInterceptor
    const responseData = res.data?.data || res.data;
    return responseData;
  },
  async addAd(id: string, payload: { type: string; durationDays: number; startDate?: string }) {
    const res = await axios.post(`${backendUrl}/api/v1/user-listings/${id}/ads`, payload, { headers: authHeaders() });
    // Handle wrapped response from TransformInterceptor
    const responseData = res.data?.data || res.data;
    return responseData;
  },
  async delete(id: string) {
    const res = await axios.delete(`${backendUrl}/api/v1/user-listings/${id}`, { headers: authHeaders() });
    // Handle wrapped response from TransformInterceptor
    const responseData = res.data?.data || res.data;
    return responseData;
  },
  async getMyListing(id: string, signal?: AbortSignal) {
    const res = await axios.get(`${backendUrl}/api/v1/user-listings/mine/${id}`, {
      headers: authHeaders(),
      signal,
    });
    // Handle wrapped response from TransformInterceptor
    const responseData = res.data?.data || res.data;
    return responseData;
  },
  async getPublicListing(id: string, signal?: AbortSignal) {
    const res = await axios.get(`${backendUrl}/api/v1/user-listings/${id}`, { signal });
    // Handle wrapped response from TransformInterceptor
    const responseData = res.data?.data || res.data;
    return responseData;
  },

  /** Same as detail pages: mine when token + success, else public. */
  async fetchListingForDisplay(id: string, signal?: AbortSignal): Promise<unknown> {
    const token = getAuthToken();
    if (token) {
      try {
        const mine = await this.getMyListing(id, signal);
        if (mine != null && typeof mine === "object") return mine;
      } catch {
        // fall through to public
      }
    }
    return this.getPublicListing(id, signal);
  },

  /**
   * Presign via fetch (apiPost) + fetch PUT to object storage (shared bucket helper).
   */
  async uploadImageViaPresign(
    kind: 'generic' | 'profile' | 'banner',
    file: File,
    opts?: { projectId?: string; userId?: string; signal?: AbortSignal },
  ): Promise<{ viewUrl: string; key: string }> {
    if (!file.type.startsWith('image/')) throw new Error('Only image files are allowed');
    if (file.size > 10 * 1024 * 1024) throw new Error('Image must be 10MB or less');

    const body: Record<string, string | number> = {
      type: kind,
      filename: file.name,
      mimeType: file.type,
      size: file.size,
    };
    if (opts?.userId != null) body.userId = opts.userId;
    if (opts?.projectId != null) body.projectId = opts.projectId;

    const payload = await apiPost<unknown>(
      '/api/v1/images/presign',
      body,
      { signal: opts?.signal },
    );

    const { uploadUrl, key } = normalizePresignPayload(payload);
    await putFileToPresignedUrl(uploadUrl, file, opts?.signal, file.type);

    const viewUrl = `${getBackendBaseUrl()}/api/v1/images/view/${key}`;
    return { viewUrl, key };
  },
};
