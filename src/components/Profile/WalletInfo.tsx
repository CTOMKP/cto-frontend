import React from 'react';
import { CircleWallet } from '../../core/circle-types';
import { copyToClipboard } from '../../utils/helper/copyToClipboard';
import { formatAddress } from '../../utils/helper/formatAddress';
import { toast } from 'react-toastify';

interface WalletInfoProps {
  wallet: CircleWallet | null;
  onShowQR?: () => void;
}

export const WalletInfo: React.FC<WalletInfoProps> = ({ wallet, onShowQR }) => {
  const handleCopyAddress = async () => {
    if (!wallet) return;
    
    try {
      const success = await copyToClipboard(wallet.address);
      if (success) {
        toast.success('Wallet address copied to clipboard!');
      } else {
        toast.error('Failed to copy address');
      }
    } catch {
      toast.error('Failed to copy address');
    }
  };

  const getBlockchainBadge = () => {
    if (!wallet) return null;
    
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
        <svg
          className="w-3 h-3 mr-1"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"
            clipRule="evenodd"
          />
        </svg>
        {wallet.blockchain}
      </span>
    );
  };

  if (!wallet) {
    return (
      <div className="card">
        <h2 className="text-xl font-semibold text-white mb-4">Wallet Information</h2>
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
          <p className="text-gray-500">No wallet available</p>
          <p className="text-sm text-gray-400 mt-1">
            Create a wallet to see information here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">Wallet Information</h2>
        {onShowQR && (
          <button
            onClick={onShowQR}
            className="btn-secondary"
          >
            <svg
              className="w-4 h-4 mr-2 inline"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V6a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1zm12 0h2a1 1 0 001-1V6a1 1 0 00-1-1h-2a1 1 0 00-1 1v1a1 1 0 001 1zM5 20h2a1 1 0 001-1v-1a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1z"
              />
            </svg>
            Show QR Code
          </button>
        )}
      </div>

      <div className="space-y-6">
        {/* Wallet Status */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
            <span className="text-sm font-medium text-white">Wallet Status</span>
          </div>
          <span className="text-sm text-green-600 font-medium">Active</span>
        </div>

        {/* Wallet Type and Blockchain */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Wallet Type</label>
            <div className="mt-1">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-500">Type:</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {wallet.type}
                </span>
              </div>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Blockchain</label>
            <div className="mt-1">
              {getBlockchainBadge()}
            </div>
          </div>
        </div>

        {/* Wallet Address */}
        <div>
          <label className="text-sm font-medium text-gray-500">Wallet Address</label>
          <div className="mt-1 flex items-center space-x-2">
            <div className="flex-1 p-3 bg-gray-100 rounded-lg font-mono text-sm text-gray-800 break-all">
              {wallet.address}
            </div>
            <button
              onClick={handleCopyAddress}
              className="p-2 text-gray-500 hover:text-gray-300 hover:bg-gray-200 rounded-lg transition-colors"
              title="Copy address"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            </button>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            This is your Aptos wallet address. Share it to receive funds.
          </p>
        </div>

        {/* Wallet Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Wallet ID</label>
            <p className="mt-1 text-sm text-white font-mono">
              {formatAddress(wallet.id, 8, 6)}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Created</label>
            <p className="mt-1 text-sm text-white">
              {new Date(wallet.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Description */}
        {wallet.description && (
          <div>
            <label className="text-sm font-medium text-gray-500">Description</label>
            <p className="mt-1 text-sm text-white">{wallet.description}</p>
          </div>
        )}

        {/* Security Info */}
        <div className="p-4 bg-blue-50 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-blue-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Security Information
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>• This is a user-controlled wallet managed by Circle</p>
                <p>• Your private keys are never stored on our servers</p>
                <p>• All transactions require your explicit approval</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="pt-4 border-t border-gray-200">
          <h3 className="text-sm font-medium text-white mb-3">Quick Actions</h3>
          <div className="flex flex-wrap gap-3">
            {onShowQR && (
              <button
                onClick={onShowQR}
                className="btn-secondary text-sm"
              >
                <svg
                  className="w-4 h-4 mr-2 inline"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V6a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1zm12 0h2a1 1 0 001-1V6a1 1 0 00-1-1h-2a1 1 0 00-1 1v1a1 1 0 001 1zM5 20h2a1 1 0 001-1v-1a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1z"
                  />
                </svg>
                Show QR Code
              </button>
            )}
            <button
              onClick={handleCopyAddress}
              className="btn-secondary text-sm"
            >
              <svg
                className="w-4 h-4 mr-2 inline"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              Copy Address
            </button>
            <button
              className="btn-secondary text-sm"
              disabled
            >
              <svg
                className="w-4 h-4 mr-2 inline"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Export Keys
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Export functionality coming soon
          </p>
        </div>
      </div>
    </div>
  );
};
