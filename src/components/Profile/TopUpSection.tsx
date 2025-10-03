import React, { useState } from 'react';
import { CircleWallet } from '../../core/circle-types';

interface TopUpSectionProps {
  wallet: CircleWallet | null;
}

export const TopUpSection: React.FC<TopUpSectionProps> = ({ wallet }) => {
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [isLoading, setIsLoading] = useState(false);

  const handleTopUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !wallet) return;

    setIsLoading(true);
    try {
      // TODO: Implement actual top-up logic with Circle API
      console.log(`Topping up ${amount} ${currency} to wallet ${wallet.id}`);
      
      // TODO: Make actual API call to Circle
      throw new Error('Top-up functionality not yet implemented');
      
    } catch (error) {
      console.error('Top-up failed:', error);
      alert('Top-up failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!wallet) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-white mb-4">Top Up Wallet</h2>
      <p className="text-gray-400 mb-4">
        Add funds to your wallet to start using the platform.
      </p>
      
      <form onSubmit={handleTopUp} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-300 mb-2">
              Amount
            </label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              min="0.01"
              step="0.01"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label htmlFor="currency" className="block text-sm font-medium text-gray-300 mb-2">
              Currency
            </label>
            <select
              id="currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="USDC">USDC</option>
              <option value="ETH">ETH</option>
            </select>
          </div>
        </div>
        
        <button
          type="submit"
          disabled={!amount || isLoading}
          className={`w-full py-2 px-4 rounded-md font-medium text-white transition-colors ${
            !amount || isLoading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isLoading ? 'Processing...' : `Top Up ${currency}`}
        </button>
      </form>
      
      <div className="mt-4 p-3 bg-blue-50 rounded-md">
        <p className="text-sm text-blue-700">
          <strong>Note:</strong> Top-up transactions may take a few minutes to process. 
          You&apos;ll receive a confirmation once the funds are added to your wallet.
        </p>
      </div>
    </div>
  );
};






