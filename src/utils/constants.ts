export const APP_CONFIG = {
  name: 'CTO Marketplace',
  version: '1.0.0',
  description: 'Circle Programmable Wallet Integration with Aptos Blockchain',
};

export const CIRCLE_CONFIG = {
  appId: process.env.REACT_APP_CIRCLE_APP_ID || '',
  apiKey: process.env.REACT_APP_CIRCLE_API_KEY || '',
  environment: process.env.REACT_APP_CIRCLE_ENVIRONMENT || 'sandbox',
  apiBase: process.env.REACT_APP_CIRCLE_API_BASE || 'https://api-sandbox.circle.com',
  blockchain: 'APTOS' as const,
  walletType: 'USER_CONTROLLED' as const,
};

export const API_ENDPOINTS = {
  circle: {
    base: CIRCLE_CONFIG.apiBase,
  },
  auth: {
    base: process.env.REACT_APP_BACKEND_URL || 'https://api.ctomarketplace.com',
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
