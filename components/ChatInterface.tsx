"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase/client";
import { VoiceRecorder } from "./VoiceRecorder";
import { VoiceMessageCard } from "./VoiceMessageCard";

interface VoiceMessage {
  id: string;
  voice_url: string;
  wallet_address: string;
  is_anonymous: boolean;
  created_at: string;
  reaction_count: number;
}

interface ChatInterfaceProps {
  walletAddress: string;
}

export function ChatInterface({ walletAddress }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<VoiceMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMessages();
    subscribeToMessages();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  async function fetchMessages() {
    try {
      const { data, error } = await supabase
        .from("voice_messages")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      // Calculate reaction counts for each message
      const messagesWithCounts = await Promise.all(
        (data || []).map(async (msg: any) => {
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

      setMessages(messagesWithCounts.reverse());
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  }

  function subscribeToMessages() {
    const channel = supabase
      .channel("voice_messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "voice_messages",
        },
        (payload) => {
          fetchMessages();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "voice_messages",
        },
        (payload) => {
          fetchMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  function handleMessageDelete(messageId: string) {
    setMessages((prevMessages) => prevMessages.filter((msg) => msg.id !== messageId));
  }

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  if (loading) {
    return <div className="text-center text-gray-400">Loading messages...</div>;
  }

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden flex flex-col" style={{ height: "600px" }}>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <VoiceMessageCard key={message.id} message={message} onDelete={handleMessageDelete} />
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="border-t border-gray-700 p-4">
        <VoiceRecorder walletAddress={walletAddress} onPostSuccess={fetchMessages} />
      </div>
    </div>
  );
}

