"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { supabase } from "@/lib/supabase/client";
import { POINTS_TO_BLA_RATE, BLA_TOKEN, ERC20_ABI } from "@/lib/contracts";
import { ConnectWallet } from "@/components/ConnectWallet";
import { Logo } from "@/components/Logo";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { sdk } from "@farcaster/miniapp-sdk";
import { Loader2 } from "lucide-react";
import { ClaimSuccessModal } from "@/components/ClaimSuccessModal";
import { parseUnits } from "viem";

export default function ClaimPage() {
  const { address, isConnected } = useAccount();
  const [claimableBLA, setClaimableBLA] = useState(0);
  const [bbPoints, setBbPoints] = useState(0);
  const [topMessageReward, setTopMessageReward] = useState(0);
  const [loading, setLoading] = useState(true);
  const [canClaim, setCanClaim] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [claiming, setClaiming] = useState(false);

  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Mini App이 로드되면 ready() 호출
    sdk.actions.ready().catch(console.error);
    
    if (address) {
      fetchClaimableAmount();
    }
  }, [address]);

  useEffect(() => {
    if (isSuccess && hash) {
      // Transaction confirmed, now save to database
      saveClaimToDatabase(hash);
    }
  }, [isSuccess, hash]);

  async function saveClaimToDatabase(transactionHash: string) {
    if (!address) return;

    try {
      const today = new Date().toISOString().split("T")[0];
      
      // Get or create user
      let { data: user } = await supabase
        .from("users")
        .select("id")
        .eq("wallet_address", address)
        .single();

      if (!user) {
        const { data: newUser } = await supabase
          .from("users")
          .insert({ wallet_address: address })
          .select()
          .single();
        user = newUser;
      }

      if (!user) {
        throw new Error("Failed to get or create user");
      }

      const pointsBLA = Math.floor(bbPoints / POINTS_TO_BLA_RATE);

      // Insert claim record
      const { error: insertError } = await supabase.from("daily_claims").insert({
        user_id: user.id,
        wallet_address: address,
        claim_date: today,
        bb_points_converted: pointsBLA,
        top_message_reward: topMessageReward,
        total_claimed: claimableBLA,
        transaction_hash: transactionHash,
      });

      if (insertError) {
        // Handle 409 Conflict (duplicate claim)
        if (insertError.code === "23505") {
          console.warn("Claim already exists in database");
        } else {
          throw insertError;
        }
      }

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

      // Show success modal
      setShowSuccessModal(true);
      setClaiming(false);
      
      // Refresh claimable amount
      fetchClaimableAmount();
    } catch (error: any) {
      console.error("Error saving claim to database:", error);
      alert(`Failed to save claim: ${error.message || "Please try again."}`);
      setClaiming(false);
    }
  }

  async function fetchClaimableAmount() {
    if (!address) return;

    setLoading(true);
    try {
      // Check if already claimed today
      const today = new Date().toISOString().split("T")[0];
      const { data: todayClaim, error: claimError } = await supabase
        .from("daily_claims")
        .select("*")
        .eq("wallet_address", address)
        .eq("claim_date", today)
        .single();

      // Handle 406 or other errors gracefully
      if (claimError && claimError.code !== "PGRST116") {
        // PGRST116 is "not found" which is expected if no claim exists
        console.error("Error checking claim:", claimError);
        // Continue to calculate claimable amount even if check fails
      }

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
    if (!address || !canClaim || claiming) return;

    // Validate BLA token address
    if (!BLA_TOKEN || BLA_TOKEN === "0x0000000000000000000000000000000000000000") {
      alert("BLA token address is not configured. Please set NEXT_PUBLIC_BLA_TOKEN environment variable.");
      return;
    }

    try {
      const today = new Date().toISOString().split("T")[0];
      
      // Double-check if already claimed today (prevent race condition)
      const { data: existingClaim } = await supabase
        .from("daily_claims")
        .select("id")
        .eq("wallet_address", address)
        .eq("claim_date", today)
        .single();

      if (existingClaim) {
        alert("You have already claimed today. Please refresh the page.");
        fetchClaimableAmount();
        return;
      }

      setClaiming(true);

      // Convert claimable BLA to wei (18 decimals)
      const amountInWei = parseUnits(claimableBLA.toString(), 18);

      // Call mint function on BLA token contract
      writeContract({
        address: BLA_TOKEN,
        abi: ERC20_ABI,
        functionName: "mint",
        args: [address, amountInWei],
      });
    } catch (error: any) {
      console.error("Error initiating claim:", error);
      alert(`Failed to initiate claim: ${error.message || "Please try again."}`);
      setClaiming(false);
    }
  }

  // Prevent hydration mismatch by only rendering after mount
  if (!mounted) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <Logo size={48} className="mb-8" />
          <div className="bg-gray-800 rounded-lg p-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Loading...</p>
          </div>
        </div>
      </main>
    );
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
              <>
                <button
                  onClick={handleClaim}
                  disabled={isPending || isConfirming || claiming}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-6 py-4 rounded-lg font-semibold text-lg transition-colors flex items-center justify-center gap-2"
                >
                  {(isPending || isConfirming || claiming) && (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  )}
                  {isPending
                    ? "Waiting for wallet..."
                    : isConfirming
                    ? "Confirming transaction..."
                    : claiming
                    ? "Processing..."
                    : `Claim ${claimableBLA} BLA`}
                </button>
                {writeError && (
                  <div className="bg-red-900 bg-opacity-50 border border-red-700 rounded-lg p-4">
                    <p className="text-red-200 text-sm">
                      Transaction failed: {writeError.message || "Please try again."}
                    </p>
                  </div>
                )}
              </>
            )}

            <div className="text-sm text-gray-400 mt-4">
              <p>• Claims reset daily at midnight UTC</p>
              <p>• 1,000 BB Points = 1 BLA Token</p>
              <p>• Top 2 messages from last 24h earn additional BLA rewards</p>
            </div>
          </div>
        )}
      </div>
      {showSuccessModal && (
        <ClaimSuccessModal
          amount={claimableBLA}
          transactionHash={hash}
          onClose={() => {
            setShowSuccessModal(false);
            fetchClaimableAmount();
          }}
        />
      )}
    </main>
  );
}

