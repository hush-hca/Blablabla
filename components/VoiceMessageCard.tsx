"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { supabase } from "@/lib/supabase/client";
import { formatAddress, formatDate } from "@/lib/utils";
import { REACTION_POINTS } from "@/lib/contracts";
import { Heart, Share2 } from "lucide-react";
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
}

const EMOJIS = ["❤️", "😂", "😢", "🔥", "💎"];

export function VoiceMessageCard({ message }: VoiceMessageCardProps) {
  const { address } = useAccount();
  const [reactionCount, setReactionCount] = useState(message.reaction_count || 0);
  const [userReactions, setUserReactions] = useState<string[]>([]);
  const [showShare, setShowShare] = useState(false);

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
        <button
          onClick={() => setShowShare(!showShare)}
          className="text-gray-400 hover:text-white"
        >
          <Share2 className="w-4 h-4" />
        </button>
      </div>

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

