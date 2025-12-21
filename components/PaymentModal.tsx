"use client";

import { POST_COSTS } from "@/lib/contracts";
import { formatUnits } from "viem";
import { X } from "lucide-react";

interface PaymentModalProps {
  onPayment: (token: "BLA" | "HUNT" | "USDC") => void;
  onClose: () => void;
}

export function PaymentModal({ onPayment, onClose }: PaymentModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Pay to Post</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-gray-400 mb-6">
          Choose a payment method to post your voice message:
        </p>
        <div className="space-y-3">
          <button
            onClick={() => {
              console.log("Pay with BLA button clicked");
              onPayment("BLA");
            }}
            className="w-full bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-medium transition-colors text-left"
          >
            <div className="font-semibold">Pay with BLA</div>
            <div className="text-sm text-gray-300">
              {formatUnits(POST_COSTS.BLA, 18)} BLA
            </div>
          </button>
          <button
            onClick={() => onPayment("HUNT")}
            className="w-full bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg font-medium transition-colors text-left"
          >
            <div className="font-semibold">Pay with HUNT</div>
            <div className="text-sm text-gray-300">
              {formatUnits(POST_COSTS.HUNT, 18)} HUNT
            </div>
          </button>
          <button
            onClick={() => onPayment("USDC")}
            className="w-full bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-medium transition-colors text-left"
          >
            <div className="font-semibold">Pay with USDC</div>
            <div className="text-sm text-gray-300">
              ${formatUnits(POST_COSTS.USDC, 6)} USDC
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}





