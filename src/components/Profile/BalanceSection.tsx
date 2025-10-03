import React from 'react';
import { WalletBalance } from '../../core/circle-types';
import { formatBalance } from '../../utils/helper/formatBalance';
import { SUPPORTED_ASSETS } from '../../core/circle-constants';

interface BalanceSectionProps {
  balances: WalletBalance[];
  isLoading: boolean;
  onRefresh?: () => Promise<void>;
  walletError?: string | null;
  clearError?: () => void;
}

export const BalanceSection: React.FC<BalanceSectionProps> = ({
  balances,
  isLoading,
  onRefresh,
  walletError,
  clearError,
}) => {

  if (isLoading) {
    return (
      <div className="card">
        <h2 className="text-xl font-semibold text-white mb-4">Wallet Balances</h2>
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                <div className="h-3 bg-gray-200 rounded animate-pulse w-32 mt-2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (balances.length === 0) {
    return (
      <div className="card">
        <h2 className="text-xl font-semibold text-white mb-4">Wallet Balances</h2>
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
              />
            </svg>
          </div>
          <p className="text-gray-500">No balances available</p>
          <p className="text-sm text-gray-400 mt-1">
            Fund your wallet to see your balances here
          </p>
        </div>
      </div>
    );
  }

  const totalValueUSD = balances.reduce((total, balance) => {
    // Simple calculation - just use the usdValue if available
    const usdValue = parseFloat(balance.usdValue) || 0;
    return total + usdValue;
  }, 0);

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">Wallet Balances</h2>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
          >
            Refresh Balances
          </button>
        )}
      </div>

      {/* Error Display */}
      {walletError && (
        <div className="mb-4 rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Wallet Error
              </h3>
              <p className="text-sm text-red-700 mt-1">{walletError}</p>
              {clearError && (
                <button
                  onClick={clearError}
                  className="mt-2 text-sm text-red-600 hover:text-red-500"
                >
                  Dismiss
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Total Portfolio Value */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-white/90">Total Portfolio Value</h3>
            <p className="text-3xl font-bold">
              ${totalValueUSD} USDC
            </p>
          </div>
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Individual Balances - Beautiful Design */}
      <div className="space-y-4">
        {balances.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                />
              </svg>
            </div>
            <p className="text-gray-500">No balances available</p>
            <p className="text-sm text-gray-400 mt-1">
              Fund your wallet to see your balances here
            </p>
          </div>
        ) : (
          balances.map((balance, index) => {
            // Get the asset info from SUPPORTED_ASSETS
            const assetInfo = SUPPORTED_ASSETS[balance.asset as keyof typeof SUPPORTED_ASSETS];
            const balanceAmount = parseFloat(balance.balance);
            const usdValue = parseFloat(balance.usdValue) || 0;
            
            // Calculate USD value if missing
            let calculatedUsdValue = usdValue;
            if (!calculatedUsdValue && balanceAmount > 0) {
              if (balance.asset === 'USDC') {
                calculatedUsdValue = balanceAmount; // 1 USDC ≈ 1 USD
              } else if (balance.asset === 'APT') {
                calculatedUsdValue = balanceAmount; // Placeholder - should use real APT price
              }
            }

            // Get the color class for the asset
            const colorClass = assetInfo?.color || 'from-gray-500 to-gray-600';

            return (
              <div key={`${balance.asset}-${index}`} className="flex items-center justify-between p-6 bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-200">
                <div className="flex items-center space-x-4">
                  {/* Asset Icon with Blockchain Badge */}
                  <div className="relative">
                    <div className={`w-14 h-14 bg-gradient-to-br ${colorClass} rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg`}>
                      {assetInfo?.logo || '💎'}
                    </div>
                    {/* Blockchain Badge - Aptos */}
                    <div className="absolute -bottom-2 -right-2 w-7 h-7 bg-gray-800 rounded-full flex items-center justify-center shadow-md">
                      <span className="text-white text-xs font-bold">A</span>
                    </div>
                  </div>
                  
                  {/* Asset Info */}
                  <div>
                    <div className="flex items-center space-x-3">
                      <h3 className="text-xl font-bold text-white">
                        {assetInfo?.name || balance.asset}
                      </h3>
                      <span className="px-3 py-1 bg-gray-200 text-gray-300 text-sm rounded-full font-medium">
                        Aptos
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Balance Amounts */}
                <div className="text-right">
                  <p className="text-2xl font-bold text-white">
                    {formatBalance(balance.balance, balance.decimals)}
                  </p>
                  <p className="text-lg text-gray-500 font-medium">
                    {balance.asset}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Currency Information */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-sm font-medium text-blue-900 mb-2">Supported Currencies</h3>
        <div className="grid grid-cols-2 gap-2 text-sm text-blue-700">
          <div>• <strong>APT:</strong> Aptos blockchain token</div>
          <div>• <strong>USDC:</strong> USD Coin (stablecoin)</div>
          <div>• <strong>USD:</strong> US Dollar (fiat)</div>
          <div>• <strong>EUR:</strong> Euro (fiat)</div>
        </div>
        <p className="text-xs text-blue-600 mt-2">
          All balances are displayed in USD equivalent for easy comparison.
        </p>
      </div>
    </div>
  );
};
