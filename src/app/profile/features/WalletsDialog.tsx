"use client";

import React from 'react';
import { BackendWallet, PrivyWalletAccount } from '@/types/privy';
import { toast } from 'react-toastify';
import { Copy } from 'lucide-react';
import { PrivyUser } from '@/types/privy';

// Helper function to get wallet chain info
function getWalletChainInfo(wallet: BackendWallet | PrivyWalletAccount) {
  const chainType = 'chainType' in wallet ? wallet.chainType : undefined;
  const blockchain = 'blockchain' in wallet ? wallet.blockchain : undefined;
  return { chainType, blockchain };
}

interface WalletsDialogProps {
  uniqueWallets: (BackendWallet | PrivyWalletAccount)[];
  user: PrivyUser | null;
  primaryWalletAddress?: string | null;
}

export default function WalletsDialog({
  uniqueWallets,
  user: _user,
  primaryWalletAddress,
}: WalletsDialogProps) {
  return (
    <div className="mt-6">
      {uniqueWallets.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-400 mb-4">No wallets found</p>
          <p className="text-sm text-gray-500">Wallets should be created automatically on login</p>
        </div>
      ) : (
        <div className="space-y-4">
          {uniqueWallets.map((wallet: BackendWallet | PrivyWalletAccount, index: number) => {
            const { chainType, blockchain } = getWalletChainInfo(wallet);
            const chain = (chainType || blockchain || '').toLowerCase();
            const chainUpper = (chainType || blockchain || '').toUpperCase();
            
            // Check if this wallet is the primary (Movement/Aptos) wallet
            const isPrimary = primaryWalletAddress && 
              wallet.address.toLowerCase() === primaryWalletAddress.toLowerCase();
            
            return (
              <div key={index} className="border border-gray-700 rounded-lg p-4 hover:border-purple-500 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">
                        {(chain === 'ethereum' || chainUpper === 'ETHEREUM') && '⟠'}
                        {(chain === 'solana' || chainUpper === 'SOLANA') && '◎'}
                        {(chain === 'base' || chainUpper === 'BASE') && '🔵'}
                        {(chain === 'polygon' || chainUpper === 'POLYGON') && '🟣'}
                        {(chain === 'aptos' || chainUpper === 'APTOS' || chainUpper === 'MOVEMENT') && '🅰️'}
                      </span>
                      <span className="font-semibold text-white capitalize">
                        {chainUpper === 'MOVEMENT' 
                          ? 'Movement Wallet' 
                          : (chain || 'Unknown') + ' Wallet'}
                      </span>
                      {isPrimary && (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                          Primary
                        </span>
                      )}
                    </div>
                    <div className="font-mono text-sm text-gray-400 break-all">
                      {wallet.address}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(wallet.address);
                      toast.success('Address copied!');
                    }}
                    className="bg-gray-800 text-white px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm ml-4 flex items-center gap-2"
                  >
                    <Copy size={14} />
                    Copy
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}

