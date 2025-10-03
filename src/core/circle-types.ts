// Circle authentication and wallet types
export interface User {
  id: string;
  email: string;
  walletId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface SignUpCredentials {
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  message: string;
}

export interface AuthError {
  message: string;
  field?: string;
}

export interface CircleWallet {
  id: string;
  type: 'USER_CONTROLLED';
  address: string;
  description: string;
  createdAt: string;
  blockchain: string;
  userId: string;
}

export interface WalletBalance {
  asset: string;
  balance: string;
  decimals: number;
  symbol: string;
  usdValue: string;
}

export interface Transaction {
  id: string;
  type: string;
  amount: string;
  asset: string;
  status: string;
  timestamp: string;
  description?: string;
}

export interface WithdrawRequest {
  walletId: string;
  amount: string;
  asset: string;
  destinationAddress: string;
  description?: string;
}

export interface QRCodeData {
  address: string;
  amount?: string;
  asset?: string;
}

