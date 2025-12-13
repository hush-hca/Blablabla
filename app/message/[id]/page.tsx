"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { VoiceMessageCard } from "@/components/VoiceMessageCard";
import { Loader2 } from "lucide-react";

export default function MessagePage() {
  const params = useParams();
  const messageId = params.id as string;
  const [message, setMessage] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (messageId) {
      fetchMessage();
    }
  }, [messageId]);

  async function fetchMessage() {
    try {
      const { data, error } = await supabase
        .from("voice_messages")
        .select(`
          *,
          reactions(count)
        `)
        .eq("id", messageId)
        .single();

      if (error) throw error;

      setMessage({
        ...data,
        reaction_count: data.reactions?.[0]?.count || 0,
      });
    } catch (error) {
      console.error("Error fetching message:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </main>
    );
  }

  if (!message) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex items-center justify-center">
        <p className="text-gray-400">Message not found</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <VoiceMessageCard message={message} />
      </div>
    </main>
  );
}

