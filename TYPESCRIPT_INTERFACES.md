# TypeScript Interfaces for Unimplemented Endpoints

This document contains all TypeScript interfaces from the test frontend for the four unimplemented endpoint categories.

---

## 1. Movement Wallet Service Interfaces

**File**: `../cto-test-frontend/src/services/movementWalletService.ts`

### WalletBalance Interface
```typescript
export interface WalletBalance {
  id: string;
  walletId: string;
  tokenAddress: string;
  tokenSymbol: string;
  balance: string;        // String representation of balance
  decimals: number;
  lastUpdated: string;    // ISO date string
}
```

### WalletTransaction Interface
```typescript
export interface WalletTransaction {
  id: string;
  walletId: string;
  txHash: string;
  txType: 'CREDIT' | 'DEBIT' | 'TRANSFER';
  amount: string;         // String representation of amount
  tokenSymbol: string;    // e.g., "MOVE", "USDC"
  status: string;
  description: string;
  createdAt: string;      // ISO date string
}
```

### Service Method Signatures
```typescript
export const movementWalletService = {
  // GET /api/v1/wallet/movement/balance/:walletId
  async getBalance(walletId: string): Promise<WalletBalance[]>
  
  // POST /api/v1/wallet/movement/sync/:walletId
  async syncBalance(walletId: string, testnet: boolean = true): Promise<WalletBalance>
  
  // GET /api/v1/wallet/movement/transactions/:walletId?limit=10
  async getTransactions(walletId: string, limit: number = 10): Promise<WalletTransaction[]>
  
  // POST /api/v1/wallet/movement/poll/:walletId
  async pollTransactions(walletId: string, testnet: boolean = true): Promise<WalletTransaction[]>
}
```

---

## 2. Movement Payment Service Interfaces

**File**: `../cto-test-frontend/src/services/movementPaymentService.ts`

### Payment Response (from createListingPayment)
The response from `createListingPayment` is not explicitly typed, but based on usage it contains:
- `paymentId`: string
- `transactionData`: object (for Privy signing)
- Other payment metadata

### Verification Response (from verifyPayment)
The response from `verifyPayment` is not explicitly typed, but typically contains:
- `success`: boolean
- `verified`: boolean
- `payment`: Payment object
- Other verification metadata

### Service Method Signatures
```typescript
export const movementPaymentService = {
  // POST /api/v1/payment/movement/listing/:listingId
  // Request Body: {} (empty)
  // Returns: Payment data including transaction data for Privy signing
  async createListingPayment(listingId: string): Promise<any>
  
  // POST /api/v1/payment/movement/verify/:paymentId
  // Request Body: { txHash: string }
  // Returns: Verification result
  async verifyPayment(paymentId: string, txHash: string): Promise<any>
}
```

### Suggested Payment Interfaces (based on usage patterns)
```typescript
// Suggested interface for payment creation response
export interface MovementPaymentResponse {
  paymentId: string;
  listingId: string;
  amount: string;
  currency: string;
  transactionData: {
    // Privy transaction payload structure
    function: string;
    typeArguments: string[];
    arguments: any[];
    type: string;
  };
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  createdAt: string;
}

// Suggested interface for payment verification response
export interface MovementPaymentVerification {
  success: boolean;
  verified: boolean;
  paymentId: string;
  txHash: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  message?: string;
}
```

---

## 3. User Listings Service - Scan Interface

**File**: `../cto-test-frontend/src/services/userListingsService.ts`

### ScanResult Interface
```typescript
export interface ScanResult {
  success: boolean;
  risk_score: number;           // 0-100
  tier: string;                  // "seed", "sprout", "bloom", "stellar", "UNQUALIFIED"
  risk_level?: string;
  eligible: boolean;            // true if risk_score >= 50
  summary?: string;
  metadata?: {
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
    lock_contract?: any;
    lock_analysis?: any;
    largest_lp_holder?: any;
    pair_address?: string;
    scan_timestamp?: string;
    verified?: boolean;
    holder_count?: number;
    creation_transaction?: string;
    distribution_metrics?: any;
    whale_analysis?: any;
    suspicious_activity_details?: any;
    activity_summary?: any;
    wallet_activity_data?: any;
    smart_contract_security?: any;
  };
  // Legacy fields for backward compatibility
  vettingScore?: number;         // Alias for risk_score
  vettingTier?: string;          // Alias for tier
  details?: any;                 // Full response data
}
```

### CreateUserListingPayload Interface
```typescript
export interface CreateUserListingPayload {
  contractAddr: string;          // Note: "contractAddr" not "contractAddress"
  chain: string;                 // Note: "chain" not "network"
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
    [key: string]: any;
  };
  vettingTier: string;           // From scan result
  vettingScore: number;          // From scan result (risk_score)
}
```

### Service Method Signature
```typescript
// POST /api/v1/user-listings/scan
// Request Body: { contractAddr: string, chain: string }
// Returns: ScanResult
async scan(contractAddr: string, chain: string = 'SOLANA'): Promise<ScanResult>
```

**Important Notes:**
- Request uses `contractAddr` (not `contractAddress`)
- Request uses `chain` (not `network`)
- Response includes both new fields (`risk_score`, `tier`) and legacy fields (`vettingScore`, `vettingTier`) for backward compatibility
- Response is wrapped: `response.data?.data || response.data`

---

## 4. Auth Profile Interface

**File**: `../cto-test-frontend/src/types/auth.types.ts`

### User Interface (Profile Response)
```typescript
export interface User {
  id: string;
  email: string;
  walletId?: string;
  avatarUrl?: string | null;
  name?: string | null;
  bio?: string | null;
  createdAt: string;            // ISO date string
  updatedAt: string;            // ISO date string
}
```

### Service Method Usage
```typescript
// GET /api/v1/auth/profile
// Returns: User object (or response with User data)
// Usage in PrivyProfilePage.tsx:
const response = await axios.get(
  `${backendUrl}/api/v1/auth/profile`,
  {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    }
  }
);

// Response structure (handles wrapped response):
// response.data?.avatarUrl  OR  response.data?.data?.avatarUrl
if (response.data?.avatarUrl) {
  setAvatarUrl(response.data.avatarUrl);
}
```

**Note**: The profile endpoint may return the User object directly or wrapped in a `data` property depending on the backend response structure.

---

## Common Patterns

### Response Handling Pattern
All endpoints handle wrapped responses from the TransformInterceptor:

```typescript
// Pattern used across all services
const responseData = response.data?.data || response.data;
return responseData;
```

### Authentication Headers Pattern
```typescript
// Helper function used across services
const getAuthHeaders = () => {
  const token = localStorage.getItem('cto_auth_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};
```

### Error Handling Pattern
```typescript
// Most services use validateStatus: () => true for scan endpoint
// to handle non-2xx responses (e.g., 400 for ineligible tokens)
const res = await axios.post(
  `${backendUrl}/api/v1/user-listings/scan`,
  { contractAddr, chain },
  { headers: authHeaders(), validateStatus: () => true }
);
```

---

## Summary

1. **Movement Wallet**: 2 interfaces (`WalletBalance`, `WalletTransaction`)
2. **Movement Payment**: No explicit interfaces (returns `any`), but suggested interfaces provided
3. **User Listings Scan**: 2 interfaces (`ScanResult`, `CreateUserListingPayload`)
4. **Auth Profile**: 1 interface (`User`)

All interfaces follow consistent patterns:
- String dates use ISO format
- Amounts/balances are strings (to preserve precision)
- Optional fields use `?` or `| null`
- Legacy fields included for backward compatibility
