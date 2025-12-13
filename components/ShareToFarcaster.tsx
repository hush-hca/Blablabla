"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { generateFarcasterFrameUrl, shareToFarcaster } from "@/lib/farcaster";

interface ShareToFarcasterProps {
  messageId: string;
  voiceUrl: string;
  onClose: () => void;
}

export function ShareToFarcaster({
  messageId,
  voiceUrl,
  onClose,
}: ShareToFarcasterProps) {
  const [sharing, setSharing] = useState(false);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 
    (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");

  async function handleShare() {
    setSharing(true);
    try {
      // Create a shareable link that opens the app and plays the message
      const shareUrl = generateFarcasterFrameUrl(messageId, appUrl);

      // Try to share via Farcaster API (if configured)
      const castHash = await shareToFarcaster(messageId, voiceUrl, appUrl);

      if (castHash) {
        // Update the message with the cast hash
        await supabase
          .from("voice_messages")
          .update({ farcaster_cast_hash: castHash })
          .eq("id", messageId);

        alert("Shared to Farcaster successfully!");
      } else {
        // Fallback: copy link to clipboard
        await navigator.clipboard.writeText(shareUrl);
        alert("Link copied to clipboard! Share it on Farcaster.");
      }

      onClose();
    } catch (error) {
      console.error("Error sharing:", error);
      alert("Failed to share. Please try again.");
    } finally {
      setSharing(false);
    }
  }

  return (
    <div className="bg-gray-600 rounded-lg p-3 mt-2">
      <p className="text-sm text-gray-300 mb-2">
        Share this voice message to your Farcaster feed
      </p>
      <button
        onClick={handleShare}
        disabled={sharing}
        className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded text-sm font-medium disabled:opacity-50"
      >
        {sharing ? "Sharing..." : "Share to Farcaster"}
      </button>
    </div>
  );
}

