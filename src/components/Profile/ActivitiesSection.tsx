import React, { useState, useEffect, useCallback } from 'react';
import { CircleWallet, Transaction } from '../../core/circle-types';
import { circleWalletService } from '../../services/circle-wallet';

interface ActivitiesSectionProps {
  wallet: CircleWallet | null;
}

export const ActivitiesSection: React.FC<ActivitiesSectionProps> = ({ wallet }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'withdrawal' | 'deposit'>('all');

  const loadTransactions = useCallback(async () => {
    if (!wallet) return;
    
    setIsLoading(true);
    try {
      console.log('Loading transactions for wallet:', wallet.id);
      
      // Fetch real transactions from Circle API
      const fetchedTransactions = await circleWalletService.getWalletTransactions(wallet.id);
      setTransactions(fetchedTransactions);
      
      console.log('Transactions loaded:', fetchedTransactions);
      
    } catch (error) {
      console.error('Failed to load transactions:', error);
      setTransactions([]);
    } finally {
      setIsLoading(false);
    }
  }, [wallet]);

  useEffect(() => {
    if (wallet) {
      loadTransactions();
    }
  }, [wallet, loadTransactions]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return '⬆️';
      case 'withdrawal':
        return '⬇️';
      default:
        return '📊';
    }
  };

  const filteredTransactions = transactions.filter(tx => 
    filter === 'all' || tx.type === filter
  );

  if (!wallet) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-white">Transactions</h2>
        <button
          onClick={loadTransactions}
          disabled={isLoading}
          className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
        >
          {isLoading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2 mb-4">
        {(['all', 'deposit', 'withdrawal'] as const).map((filterType) => (
          <button
            key={filterType}
            onClick={() => setFilter(filterType)}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              filter === filterType
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
            }`}
          >
            {filterType === 'all' ? 'All' : filterType.charAt(0).toUpperCase() + filterType.slice(1)}
          </button>
        ))}
      </div>

      {/* Transactions List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading transactions...</p>
          </div>
        ) : filteredTransactions.length === 0 ? (
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
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <p className="text-gray-500">No transactions found</p>
            <p className="text-sm text-gray-400 mt-1">
              Your transaction history will appear here once you make deposits or withdrawals
            </p>
          </div>
        ) : (
          filteredTransactions.map((tx) => (
            <div key={tx.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{getTypeIcon(tx.type)}</span>
                <div>
                  <p className="font-medium text-white">
                    {tx.type === 'deposit' ? 'Deposit' : 'Withdrawal'} - {tx.asset}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(tx.timestamp).toLocaleDateString()} at{' '}
                    {new Date(tx.timestamp).toLocaleTimeString()}
                  </p>
                  {tx.description && (
                    <p className="text-xs text-gray-400">{tx.description}</p>
                  )}
                </div>
              </div>
              
              <div className="text-right">
                <p className={`font-semibold ${
                  tx.type === 'deposit' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {tx.type === 'deposit' ? '+' : '-'}
                  {tx.amount} {tx.asset}
                </p>
                <span className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusColor(tx.status)}`}>
                  {tx.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Export Button */}
      {filteredTransactions.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button className="w-full py-2 px-4 border border-gray-300 rounded-md text-gray-300 hover:bg-gray-50 transition-colors">
            Export Transaction History
          </button>
        </div>
      )}
    </div>
  );
};






