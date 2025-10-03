import React, { useState } from 'react';
import { CircleWallet, WalletBalance } from '../../core/circle-types';

interface WithdrawSectionProps {
  wallet: CircleWallet | null;
  balances: WalletBalance[];
}

export const WithdrawSection: React.FC<WithdrawSectionProps> = ({ wallet, balances }) => {
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [destinationAddress, setDestinationAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !destinationAddress || !wallet) return;

    setIsLoading(true);
    try {
      // TODO: Implement actual withdraw logic with Circle API
      console.log(`Withdrawing ${amount} ${currency} from wallet ${wallet.id} to ${destinationAddress}`);
      
      // TODO: Make actual API call to Circle
      throw new Error('Withdrawal functionality not yet implemented');
      
    } catch (error) {
      console.error('Withdrawal failed:', error);
      alert('Withdrawal failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!wallet) {
    return null;
  }

  // Get available balance for selected currency
  const availableBalance = balances.find(b => b.asset === currency)?.balance || '0';

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-white mb-4">Withdraw Funds</h2>
      <p className="text-gray-400 mb-4">
        Withdraw funds from your wallet to an external address.
      </p>
      
      <form onSubmit={handleWithdraw} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="withdraw-amount" className="block text-sm font-medium text-gray-300 mb-2">
              Amount
            </label>
            <input
              type="number"
              id="withdraw-amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              min="0.01"
              max={availableBalance}
              step="0.01"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Available: {availableBalance} {currency}
            </p>
          </div>
          
          <div>
            <label htmlFor="withdraw-currency" className="block text-sm font-medium text-gray-300 mb-2">
              Currency
            </label>
            <select
              id="withdraw-currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {balances.map(balance => (
                <option key={balance.asset} value={balance.asset}>
                  {balance.asset} - {balance.balance}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div>
          <label htmlFor="destination-address" className="block text-sm font-medium text-gray-300 mb-2">
            Destination Address
          </label>
          <input
            type="text"
            id="destination-address"
            value={destinationAddress}
            onChange={(e) => setDestinationAddress(e.target.value)}
            placeholder="Enter wallet address"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <button
          type="submit"
          disabled={!amount || !destinationAddress || isLoading}
          className={`w-full py-2 px-4 rounded-md font-medium text-white transition-colors ${
            !amount || !destinationAddress || isLoading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-red-600 hover:bg-red-700'
          }`}
        >
          {isLoading ? 'Processing...' : `Withdraw ${currency}`}
        </button>
      </form>
      
      <div className="mt-4 p-3 bg-red-50 rounded-md">
        <p className="text-sm text-red-700">
          <strong>Warning:</strong> Withdrawals are irreversible. Please double-check the destination address 
          before confirming. Withdrawal fees may apply.
        </p>
      </div>
    </div>
  );
};






