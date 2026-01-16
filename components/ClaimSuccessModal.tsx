"use client";

import { CheckCircle2, X } from "lucide-react";

interface ClaimSuccessModalProps {
  amount: number;
  transactionHash?: string;
  onClose: () => void;
}

export function ClaimSuccessModal({
  amount,
  transactionHash,
  onClose,
}: ClaimSuccessModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Claim Successful!</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="text-center py-4">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <p className="text-lg font-semibold mb-2">
            You've successfully claimed {amount} BLA tokens!
          </p>
          {transactionHash && (
            <a
              href={`https://basescan.org/tx/${transactionHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 text-sm underline"
            >
              View on BaseScan
            </a>
          )}
        </div>
        <button
          onClick={onClose}
          className="w-full bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-medium transition-colors mt-4"
        >
          Close
        </button>
      </div>
    </div>
  );
}
