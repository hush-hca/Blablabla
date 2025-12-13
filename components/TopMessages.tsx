"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { VoiceMessageCard } from "./VoiceMessageCard";

interface VoiceMessage {
  id: string;
  voice_url: string;
  wallet_address: string;
  is_anonymous: boolean;
  created_at: string;
  reaction_count: number;
}

export function TopMessages() {
  const [topMessages, setTopMessages] = useState<VoiceMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTopMessages();
  }, []);

  async function fetchTopMessages() {
    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      // Get all messages from last 24 hours
      const { data: messages, error } = await supabase
        .from("voice_messages")
        .select("*")
        .gte("created_at", yesterday.toISOString())
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Calculate reaction counts for each message
      const messagesWithCounts = await Promise.all(
        (messages || []).map(async (msg: any) => {
          const { count } = await supabase
            .from("reactions")
            .select("*", { count: "exact", head: true })
            .eq("message_id", msg.id);

          return {
            ...msg,
            reaction_count: count || 0,
          };
        })
      );

      messagesWithCounts.sort((a, b) => b.reaction_count - a.reaction_count);
      setTopMessages(messagesWithCounts.slice(0, 2));
    } catch (error) {
      console.error("Error fetching top messages:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">🏆 Top Messages (Last 24h)</h2>
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  if (topMessages.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">🏆 Top Messages (Last 24h)</h2>
        <p className="text-gray-400">No messages yet. Be the first to share!</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">🏆 Top Messages (Last 24h)</h2>
      <div className="space-y-4">
        {topMessages.map((message, index) => (
          <div key={message.id} className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">
                {index === 0 ? "🥇" : "🥈"}
              </span>
              <span className="text-sm text-gray-400">
                {message.reaction_count} reactions
              </span>
            </div>
            <VoiceMessageCard message={message} />
          </div>
        ))}
      </div>
    </div>
  );
}

