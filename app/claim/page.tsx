"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { supabase } from "@/lib/supabase/client";
import { POINTS_TO_BLA_RATE, BLA_TOKEN, ERC20_ABI, CLAIM_TREASURY_ADDRESS } from "@/lib/contracts";
import { ConnectWallet } from "@/components/ConnectWallet";
import { Logo } from "@/components/Logo";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther } from "viem";
import { Loader2 } from "lucide-react";

export default function ClaimPage() {
  const { address, isConnected } = useAccount();
  const [claimableBLA, setClaimableBLA] = useState(0);
  const [bbPoints, setBbPoints] = useState(0);
  const [topMessageReward, setTopMessageReward] = useState(0);
  const [loading, setLoading] = useState(true);
  const [canClaim, setCanClaim] = useState(false);

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    if (address) {
      fetchClaimableAmount();
    }
  }, [address]);

  useEffect(() => {
    if (isSuccess && hash) {
      // Save claim record to database after successful transaction
      saveClaimRecord();
    }
  }, [isSuccess, hash]);

  async function saveClaimRecord() {
    if (!address || !hash) return;

    try {
      const today = new Date().toISOString().split("T")[0];
      const pointsBLA = Math.floor(bbPoints / POINTS_TO_BLA_RATE);

      await supabase.from("daily_claims").insert({
        wallet_address: address,
        claim_date: today,
        bb_points_converted: pointsBLA,
        top_message_reward: topMessageReward,
        total_claimed: claimableBLA,
        transaction_hash: hash,
      });

      // Mark top message rewards as claimed
      if (topMessageReward > 0) {
        const { data: userMessages } = await supabase
          .from("voice_messages")
          .select("id")
          .eq("wallet_address", address);

        const messageIds = userMessages?.map((m) => m.id) || [];

        if (messageIds.length > 0) {
          await supabase
            .from("top_message_rewards")
            .update({ claimed: true })
            .in("message_id", messageIds)
            .eq("claimed", false);
        }
      }

      alert("BLA tokens claimed successfully!");
      fetchClaimableAmount();
    } catch (error) {
      console.error("Error saving claim record:", error);
      // Transaction succeeded but database save failed - still show success
      alert("BLA tokens claimed successfully! (Note: Claim record may not be saved)");
      fetchClaimableAmount();
    }
  }

  async function fetchClaimableAmount() {
    if (!address) return;

    setLoading(true);
    try {
      // Check if already claimed today
      const today = new Date().toISOString().split("T")[0];
      const { data: todayClaim } = await supabase
        .from("daily_claims")
        .select("*")
        .eq("wallet_address", address)
        .eq("claim_date", today)
        .single();

      if (todayClaim) {
        setCanClaim(false);
        setClaimableBLA(0);
        setLoading(false);
        return;
      }

      // Get total BB Points
      const { data: pointsData } = await supabase
        .from("bb_points")
        .select("points")
        .eq("wallet_address", address);

      const totalPoints = pointsData?.reduce((sum, p) => sum + p.points, 0) || 0;
      setBbPoints(totalPoints);

      // Get top message rewards - need to join with voice_messages to get wallet_address
      const { data: userMessages } = await supabase
        .from("voice_messages")
        .select("id")
        .eq("wallet_address", address);

      const messageIds = userMessages?.map((m) => m.id) || [];

      let totalReward = 0;
      if (messageIds.length > 0) {
        const { data: rewards } = await supabase
          .from("top_message_rewards")
          .select("reward_amount")
          .in("message_id", messageIds)
          .eq("claimed", false);

        totalReward = rewards?.reduce((sum, r) => sum + r.reward_amount, 0) || 0;
      }
      setTopMessageReward(totalReward);

      // Calculate total claimable BLA
      const pointsBLA = Math.floor(totalPoints / POINTS_TO_BLA_RATE);
      const totalBLA = pointsBLA + totalReward;

      setClaimableBLA(totalBLA);
      setCanClaim(totalBLA > 0);
    } catch (error) {
      console.error("Error fetching claimable amount:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleClaim() {
    if (!address || !canClaim) return;

    try {
      // Validate BLA token address
      if (!BLA_TOKEN || BLA_TOKEN === "0x0000000000000000000000000000000000000000") {
        alert("BLA token address is not configured. Please set NEXT_PUBLIC_BLA_TOKEN environment variable.");
        return;
      }

      const amount = parseEther(claimableBLA.toString());

      // Try to mint tokens first (for testnet contracts with mint function)
      // If that fails or if treasury address is set, use transfer from treasury
      try {
        if (CLAIM_TREASURY_ADDRESS && CLAIM_TREASURY_ADDRESS !== "0x0000000000000000000000000000000000000000") {
          // Transfer from treasury address
          // Note: Treasury address needs to approve this contract or user needs to have allowance
          // For now, we'll try direct transfer (requires treasury to have approved)
          writeContract({
            address: BLA_TOKEN,
            abi: ERC20_ABI,
            functionName: "transfer",
            args: [address, amount],
          });
        } else {
          // Try mint function (for testnet)
          writeContract({
            address: BLA_TOKEN,
            abi: ERC20_ABI,
            functionName: "mint",
            args: [address, amount],
          });
        }
      } catch (error) {
        console.error("Contract call error:", error);
        alert("Failed to initiate claim transaction. Please try again.");
      }
    } catch (error) {
      console.error("Error claiming:", error);
      alert("Failed to claim. Please try again.");
    }
  }

  if (!isConnected) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <Logo size={48} className="mb-8" />
          <ConnectWallet />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Logo size={48} className="mb-8" />
        <h1 className="text-4xl font-bold mb-8">Claim Your BLA Tokens</h1>

        {loading ? (
          <div className="bg-gray-800 rounded-lg p-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Loading claimable amount...</p>
          </div>
        ) : (
          <div className="bg-gray-800 rounded-lg p-8 space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Your Rewards</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">BB Points:</span>
                  <span className="font-semibold">{bbPoints.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">BB Points → BLA:</span>
                  <span className="font-semibold">
                    {Math.floor(bbPoints / POINTS_TO_BLA_RATE)} BLA
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Top Message Reward:</span>
                  <span className="font-semibold">{topMessageReward} BLA</span>
                </div>
                <div className="border-t border-gray-700 pt-3 flex justify-between text-xl">
                  <span className="font-semibold">Total Claimable:</span>
                  <span className="font-bold text-blue-400">{claimableBLA} BLA</span>
                </div>
              </div>
            </div>

            {!canClaim && (
              <div className="bg-yellow-900 bg-opacity-50 border border-yellow-700 rounded-lg p-4">
                <p className="text-yellow-200">
                  You have already claimed today. Come back tomorrow!
                </p>
              </div>
            )}

            {canClaim && (
              <button
                onClick={handleClaim}
                disabled={isPending || isConfirming}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-6 py-4 rounded-lg font-semibold text-lg transition-colors flex items-center justify-center gap-2"
              >
                {(isPending || isConfirming) && (
                  <Loader2 className="w-5 h-5 animate-spin" />
                )}
                {isPending || isConfirming ? "Claiming..." : `Claim ${claimableBLA} BLA`}
              </button>
            )}

            <div className="text-sm text-gray-400 mt-4">
              <p>• Claims reset daily at midnight UTC</p>
              <p>• 1,000 BB Points = 1 BLA Token</p>
              <p>• Top 2 messages from last 24h earn additional BLA rewards</p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

