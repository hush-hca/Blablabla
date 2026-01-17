"use client";

import { useState, useEffect } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { supabase } from "@/lib/supabase/client";
import { formatAddress, formatDate } from "@/lib/utils";
import { REACTION_POINTS, USDC_TOKEN, ERC20_ABI, PAYMENT_RECEIVER_ADDRESS, DELETE_FEE_USDC } from "@/lib/contracts";
import { Share2, Trash2, Loader2 } from "lucide-react";
import { ShareToFarcaster } from "./ShareToFarcaster";

interface VoiceMessage {
  id: string;
  voice_url: string;
  wallet_address: string;
  is_anonymous: boolean;
  created_at: string;
  reaction_count?: number;
}

interface VoiceMessageCardProps {
  message: VoiceMessage;
  onDelete?: (messageId: string) => void;
}

const EMOJIS = ["❤️", "😂", "😢", "🔥", "💎"];

export function VoiceMessageCard({ message, onDelete }: VoiceMessageCardProps) {
  const { address } = useAccount();
  const [reactionCount, setReactionCount] = useState(message.reaction_count || 0);
  const [userReactions, setUserReactions] = useState<string[]>([]);
  const [showShare, setShowShare] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { writeContract, data: deleteHash, isPending: isDeletePending } = useWriteContract();
  const { isLoading: isDeleteConfirming, isSuccess: isDeleteSuccess } = useWaitForTransactionReceipt({
    hash: deleteHash,
  });

  useEffect(() => {
    fetchReactionCount();
    if (address) {
      fetchUserReactions();
    }
  }, [address, message.id]);

  async function fetchReactionCount() {
    try {
      const { count } = await supabase
        .from("reactions")
        .select("*", { count: "exact", head: true })
        .eq("message_id", message.id);
      
      if (count !== null) {
        setReactionCount(count);
      }
    } catch (error) {
      console.error("Error fetching reaction count:", error);
    }
  }

  async function fetchUserReactions() {
    if (!address) return;

    try {
      const { data } = await supabase
        .from("reactions")
        .select("emoji")
        .eq("message_id", message.id)
        .eq("wallet_address", address);

      if (data) {
        setUserReactions(data.map((r) => r.emoji));
      }
    } catch (error) {
      console.error("Error fetching reactions:", error);
    }
  }

  useEffect(() => {
    if (isDeleteSuccess && deleteHash) {
      handleDeleteFromDatabase();
    }
  }, [isDeleteSuccess, deleteHash]);

  async function handleDelete() {
    if (!address) {
      alert("Please connect your wallet to delete");
      return;
    }

    // Check if user is the creator
    if (address.toLowerCase() !== message.wallet_address.toLowerCase()) {
      alert("You can only delete your own messages");
      return;
    }

    // Validate USDC token address
    if (!USDC_TOKEN || USDC_TOKEN === "0x0000000000000000000000000000000000000000") {
      alert("USDC token address is not configured. Please set NEXT_PUBLIC_USDC_TOKEN environment variable.");
      return;
    }

    // Validate payment receiver address
    if (!PAYMENT_RECEIVER_ADDRESS || PAYMENT_RECEIVER_ADDRESS === "0x0000000000000000000000000000000000000000") {
      alert("Payment receiver address is not configured. Please set NEXT_PUBLIC_PAYMENT_RECEIVER_ADDRESS environment variable.");
      return;
    }

    setIsDeleting(true);

    try {
      writeContract({
        address: USDC_TOKEN,
        abi: ERC20_ABI,
        functionName: "transfer",
        args: [PAYMENT_RECEIVER_ADDRESS, DELETE_FEE_USDC],
      });
    } catch (error) {
      console.error("Delete transaction error:", error);
      alert("Failed to initiate delete transaction. Please try again.");
      setIsDeleting(false);
    }
  }

  async function handleDeleteFromDatabase() {
    try {
      // Extract file path from voice_url
      // voice_url format: https://[project].supabase.co/storage/v1/object/public/voice-messages/[filename]
      const urlParts = message.voice_url.split("/voice-messages/");
      const fileName = urlParts.length > 1 ? urlParts[1] : null;

      // Delete reactions first (foreign key constraint)
      await supabase
        .from("reactions")
        .delete()
        .eq("message_id", message.id);

      // Delete the voice message from database
      const { error } = await supabase
        .from("voice_messages")
        .delete()
        .eq("id", message.id);

      if (error) throw error;

      // Delete the audio file from storage if we can extract the filename
      if (fileName) {
        try {
          await supabase.storage
            .from("voice-messages")
            .remove([fileName]);
        } catch (storageError) {
          // Log but don't fail if storage deletion fails
          console.warn("Failed to delete storage file:", storageError);
        }
      }

      // Call parent callback to update UI
      if (onDelete) {
        onDelete(message.id);
      }
    } catch (error) {
      console.error("Error deleting message from database:", error);
      alert("Transaction succeeded but failed to delete from database. Please refresh the page.");
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleReaction(emoji: string) {
    if (!address) {
      alert("Please connect your wallet to react");
      return;
    }

    try {
      const isReacted = userReactions.includes(emoji);

      if (isReacted) {
        // Remove reaction
        const { error } = await supabase
          .from("reactions")
          .delete()
          .eq("message_id", message.id)
          .eq("wallet_address", address)
          .eq("emoji", emoji);

        if (error) throw error;

        setUserReactions(userReactions.filter((e) => e !== emoji));
        setReactionCount(reactionCount - 1);

        // Remove BB points (simplified - in production, you'd track this better)
      } else {
        // Add reaction
        const { data: user } = await supabase
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
          if (newUser) {
            await supabase.from("reactions").insert({
              message_id: message.id,
              user_id: newUser.id,
              wallet_address: address,
              emoji,
            });

            // Award BB Points
            await supabase.from("bb_points").insert({
              user_id: newUser.id,
              wallet_address: address,
              points: REACTION_POINTS,
              source: "reaction",
              source_id: message.id,
            });
          }
        } else {
          await supabase.from("reactions").insert({
            message_id: message.id,
            user_id: user.id,
            wallet_address: address,
            emoji,
          });

          // Award BB Points
          await supabase.from("bb_points").insert({
            user_id: user.id,
            wallet_address: address,
            points: REACTION_POINTS,
            source: "reaction",
            source_id: message.id,
          });
        }

        setUserReactions([...userReactions, emoji]);
        setReactionCount(reactionCount + 1);
      }
    } catch (error) {
      console.error("Error handling reaction:", error);
      alert("Failed to react. Please try again.");
    }
  }

  const isCreator = address && address.toLowerCase() === message.wallet_address.toLowerCase();
  const isDeleteInProgress = isDeleting || isDeletePending || isDeleteConfirming;

  return (
    <div className="bg-gray-700 rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">
            {message.is_anonymous ? "Anonymous" : formatAddress(message.wallet_address)}
          </span>
          <span className="text-xs text-gray-500">
            {formatDate(message.created_at)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isCreator && (
            <button
              onClick={handleDelete}
              disabled={isDeleteInProgress}
              className="text-red-400 hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Delete (1 USDC fee)"
            >
              {isDeleteInProgress ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
            </button>
          )}
          <button
            onClick={() => setShowShare(!showShare)}
            className="text-gray-400 hover:text-white"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {isDeleteInProgress && (
        <div className="flex items-center gap-2 text-yellow-400 text-sm">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Deleting...</span>
        </div>
      )}

      <audio src={message.voice_url} controls className="w-full" />

      {showShare && (
        <ShareToFarcaster
          messageId={message.id}
          voiceUrl={message.voice_url}
          onClose={() => setShowShare(false)}
        />
      )}

      <div className="flex items-center gap-2">
        {EMOJIS.map((emoji) => (
          <button
            key={emoji}
            onClick={() => handleReaction(emoji)}
            className={`px-2 py-1 rounded text-lg transition-colors ${
              userReactions.includes(emoji)
                ? "bg-blue-600"
                : "bg-gray-600 hover:bg-gray-500"
            }`}
          >
            {emoji}
          </button>
        ))}
        {reactionCount > 0 && (
          <span className="text-sm text-gray-400 ml-2">{reactionCount}</span>
        )}
      </div>
    </div>
  );
}

