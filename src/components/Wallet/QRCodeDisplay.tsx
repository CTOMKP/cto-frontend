import React, { useState } from 'react';
import QRCode from 'react-qr-code';
import { copyToClipboard } from '../../utils/helper/copyToClipboard';
import { formatAddress } from '../../utils/helper/formatAddress';
import { QRCodeData } from '../../core/circle-types';
import { toast } from 'react-toastify';

interface QRCodeDisplayProps {
  data: QRCodeData;
  title?: string;
  description?: string;
  showCopyButton?: boolean;
  className?: string;
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
  data,
  title = 'Wallet Address',
  description = 'Scan this QR code to send funds to your wallet',
  showCopyButton = true,
  className = '',
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyAddress = async () => {
    try {
      const success = await copyToClipboard(data.address);
      if (success) {
        setCopied(true);
        toast.success('Address copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
      } else {
        toast.error('Failed to copy address');
      }
    } catch {
      toast.error('Failed to copy address');
    }
  };

  const qrValue = data.amount && data.asset 
    ? `${data.address}?amount=${data.amount}&asset=${data.asset}`
    : data.address;

  return (
    <div className={`text-center ${className}`}>
      {title && (
        <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      )}
      
      {description && (
        <p className="text-sm text-gray-400 mb-4">{description}</p>
      )}

      <div className="inline-block p-4 bg-gray-800 rounded-lg border border-gray-700 shadow-sm">
        <QRCode
          value={qrValue}
          size={200}
          level="M"
          fgColor="#1f2937"
          bgColor="#ffffff"
        />
      </div>

      <div className="mt-4">
        <div className="p-3 bg-gray-100 rounded-lg">
          <p className="text-xs text-gray-400 mb-1">Wallet Address:</p>
          <p className="text-sm font-mono text-gray-800 break-all">
            {formatAddress(data.address, 8, 6)}
          </p>
        </div>

        {showCopyButton && (
          <button
            onClick={handleCopyAddress}
            disabled={copied}
            className={`mt-3 px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
              copied
                ? 'bg-green-100 text-green-800 cursor-not-allowed'
                : 'bg-purple-600 hover:bg-purple-700 text-white'
            }`}
          >
            {copied ? (
              <div className="flex items-center justify-center">
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Copied!
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <svg
                  className="w-4 h-4 mr-2"
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
              </div>
            )}
          </button>
        )}
      </div>

      {data.amount && data.asset && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <span className="font-medium">Amount:</span> {data.amount} {data.asset}
          </p>
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500">
        <p>Send APT or USDC to this address to fund your wallet</p>
        <p className="mt-1">Make sure you&apos;re sending to the correct network (Aptos)</p>
      </div>
    </div>
  );
};
