// Circle authentication constants
export const APP_CONFIG = {
  name: 'CTO Marketplace',
  version: '1.0.0',
  description: 'Circle Programmable Wallet Integration with Aptos Blockchain',
};

export const CIRCLE_CONFIG = {
  appId: process.env.NEXT_PUBLIC_CIRCLE_APP_ID || '',
  apiKey: process.env.NEXT_PUBLIC_CIRCLE_API_KEY || '',
  environment: process.env.NEXT_PUBLIC_CIRCLE_ENVIRONMENT || 'sandbox',
  apiBase: process.env.NEXT_PUBLIC_CIRCLE_API_BASE || 'https://api.circle.com/v1/w3s',
  blockchain: 'APTOS' as const,
  walletType: 'USER_CONTROLLED' as const,
};

// Validate required environment variables
export const validateEnvironment = () => {
  const requiredVars = [
    'NEXT_PUBLIC_CIRCLE_APP_ID',
    'NEXT_PUBLIC_CIRCLE_API_KEY',
    'NEXT_PUBLIC_CIRCLE_API_BASE'
  ];
  
  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    console.warn(`Missing environment variables: ${missing.join(', ')}`);
    return false;
  }
  
  return true;
};

export const GOOGLE_CONFIG = {
  clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
};

export const API_ENDPOINTS = {
  circle: {
    base: CIRCLE_CONFIG.apiBase,
  },
  auth: {
    base: process.env.NEXT_PUBLIC_AUTH_API_BASE || process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'https://cto-backend-production-28e3.up.railway.app',
  },
};

export const SUPPORTED_ASSETS = {
  APT: {
    symbol: 'APT',
    name: 'Aptos',
    decimals: 8,
    logo: '🟣',
    color: 'from-purple-600 to-blue-600',
  },
  USDC: {
    symbol: 'USDC',
    name: 'USDC',
    decimals: 6,
    logo: '💙',
    color: 'from-blue-600 to-green-600',
  },
};

export const ERROR_MESSAGES = {
  wallet: {
    creationFailed: 'Failed to create wallet. Please try again.',
    balanceFetchFailed: 'Failed to fetch wallet balances.',
    withdrawalFailed: 'Withdrawal failed. Please check your details and try again.',
    invalidAddress: 'Please enter a valid Aptos address.',
    insufficientBalance: 'Insufficient balance for this transaction.',
  },
  auth: {
    loginFailed: 'Login failed. Please check your credentials.',
    signupFailed: 'Signup failed. Please try again.',
    sessionExpired: 'Your session has expired. Please login again.',
  },
  general: {
    networkError: 'Network error. Please check your connection.',
    unknownError: 'An unexpected error occurred.',
  },
};
