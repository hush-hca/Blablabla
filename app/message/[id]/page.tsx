"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { VoiceMessageCard } from "@/components/VoiceMessageCard";
import { Logo } from "@/components/Logo";
import { MiniAppEmbed } from "@/components/MiniAppEmbed";
import { sdk } from "@farcaster/miniapp-sdk";
import { Loader2 } from "lucide-react";

export default function MessagePage() {
  const params = useParams();
  const messageId = params.id as string;
  const [message, setMessage] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mini App이 로드되면 ready() 호출
    sdk.actions.ready().catch(console.error);
    
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
      <>
        <MiniAppEmbed messageId={messageId} />
      <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <Logo size={48} className="mb-8" />
          <div className="flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        </div>
      </main>
      </>
    );
  }

  if (!message) {
    return (
      <>
        <MiniAppEmbed messageId={messageId} />
      <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <Logo size={48} className="mb-8" />
          <div className="flex items-center justify-center">
            <p className="text-gray-400">Message not found</p>
          </div>
        </div>
      </main>
      </>
    );
  }

  return (
    <>
      <MiniAppEmbed messageId={messageId} />
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Logo size={48} className="mb-8" />
        <VoiceMessageCard message={message} />
      </div>
    </main>
    </>
  );
}





