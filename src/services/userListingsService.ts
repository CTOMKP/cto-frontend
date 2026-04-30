import { getAuthToken } from '@/lib/authSession';
import { ApiError } from '@/lib/apiError';
import { apiDelete, apiGet, apiPatch, apiPost, getBackendBaseUrl } from '@/lib/apiClient';
import { unwrapApiData } from '@/lib/apiResponse';
import {
  normalizePresignPayload,
  putFileToPresignedUrl,
} from '@/lib/presignedUpload';

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
    try {
      const raw = await apiPost<unknown>(`/api/v1/user-listings/scan`, { contractAddr, chain });
      const responseData = unwrapApiData<Record<string, unknown>>(raw);
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
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 401) {
          throw new Error('Unauthorized');
        }
        const responseData = unwrapApiData<Record<string, unknown>>(error.body);
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
            vettingScore: responseData?.risk_score ?? 0,
            vettingTier: responseData?.tier ?? 'UNQUALIFIED',
            details: responseData,
          } as ScanResult;
        }
        const message = (responseData && (responseData.message || responseData.error)) ||
          'Token does not meet minimum criteria for any tier';
        return {
          success: false,
          risk_score: Number(responseData?.risk_score ?? 0),
          tier: String(responseData?.tier ?? 'UNQUALIFIED'),
          eligible: false,
          vettingScore: responseData?.risk_score ?? 0,
          vettingTier: responseData?.tier ?? 'UNQUALIFIED',
          details: {
            success: false,
            risk_score: Number(responseData?.risk_score ?? 0),
            tier: String(responseData?.tier ?? 'UNQUALIFIED'),
            eligible: false,
            message,
            status: error.status,
            raw: responseData
          } as ScanResultDetails,
        } as ScanResult;
      }
      throw error;
    }
  },

  /**
   * Create a new user listing
   * @param payload - Listing data including contract address, chain, title, description, etc.
   * @returns Created listing data with ID
   */
  async create(payload: CreateUserListingPayload) {
    try {
      const res = await apiPost<unknown>(`/api/v1/user-listings`, payload);
      return unwrapApiData(res);
    } catch (error) {
      if (error instanceof ApiError) {
        const errData = unwrapApiData<Record<string, unknown>>(error.body);
        const message = errData?.message || `Request failed with status ${error.status}`;
        const err = new Error(String(message)) as Error & { response?: { data?: unknown }; status?: number };
        err.response = { data: error.body };
        err.status = error.status;
        throw err;
      }
      throw error;
    }
  },
  async update(id: string, payload: Partial<CreateUserListingPayload>) {
    const res = await apiPatch<unknown>(`/api/v1/user-listings/${id}`, payload);
    return unwrapApiData(res);
  },
  async publish(id: string) {
    const res = await apiPost<unknown>(`/api/v1/user-listings/${id}/publish`, {});
    return unwrapApiData(res);
  },
  async mine(signal?: AbortSignal) {
    // Standard path for all user listings
    const res = await apiGet<unknown>(`/api/v1/user-listings/mine/all`, { signal });
    return unwrapApiData(res);
  },
  async listPublic(page = 1, limit = 20) {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    const res = await apiGet<unknown>(`/api/v1/user-listings?${params.toString()}`);
    return unwrapApiData(res);
  },
  async addAd(id: string, payload: { type: string; durationDays: number; startDate?: string }) {
    const res = await apiPost<unknown>(`/api/v1/user-listings/${id}/ads`, payload);
    return unwrapApiData(res);
  },
  async delete(id: string) {
    const res = await apiDelete<unknown>(`/api/v1/user-listings/${id}`);
    return unwrapApiData(res);
  },
  async getMyListing(id: string, signal?: AbortSignal) {
    const res = await apiGet<unknown>(`/api/v1/user-listings/mine/${id}`, { signal });
    return unwrapApiData(res);
  },
  async getPublicListing(id: string, signal?: AbortSignal) {
    const res = await apiGet<unknown>(`/api/v1/user-listings/${id}`, { signal });
    return unwrapApiData(res);
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
