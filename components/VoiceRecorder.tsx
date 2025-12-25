"use client";

import { useState, useRef, useEffect } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther, formatUnits } from "viem";
import { supabase } from "@/lib/supabase/client";
import { POST_COSTS, BLA_TOKEN, HUNT_TOKEN, USDC_TOKEN, ERC20_ABI, PAYMENT_RECEIVER_ADDRESS } from "@/lib/contracts";
import { PaymentModal } from "./PaymentModal";
import { Mic, Loader2 } from "lucide-react";

interface VoiceRecorderProps {
  walletAddress: string;
  onPostSuccess: () => void;
}

export function VoiceRecorder({ walletAddress, onPostSuccess }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const usedTransactionHashRef = useRef<string | null>(null);
  const isCancelingRef = useRef<boolean>(false);

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    if (isSuccess && audioBlob && hash && hash !== usedTransactionHashRef.current) {
      usedTransactionHashRef.current = hash;
      handleUpload();
    }
  }, [isSuccess, audioBlob, hash]);

  async function startRecording() {
    try {
      // Reset state for new recording
      usedTransactionHashRef.current = null;
      isCancelingRef.current = false;
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        // Only create blob if not canceling
        if (!isCancelingRef.current) {
          const blob = new Blob(chunksRef.current, { type: "audio/webm" });
          setAudioBlob(blob);
          setAudioUrl(URL.createObjectURL(blob));
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error starting recording:", error);
      alert("Failed to access microphone. Please check permissions.");
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
      setShowPaymentModal(true);
    }
  }

  async function handlePayment(token: "BLA" | "HUNT" | "USDC") {
    const tokenAddress =
      token === "BLA"
        ? BLA_TOKEN
        : token === "HUNT"
        ? HUNT_TOKEN
        : USDC_TOKEN;

    // Validate token address
    if (!tokenAddress || tokenAddress === "0x0000000000000000000000000000000000000000") {
      alert(`${token} token address is not configured. Please set NEXT_PUBLIC_${token}_TOKEN environment variable.`);
      return;
    }

    // Validate payment receiver address
    if (!PAYMENT_RECEIVER_ADDRESS || PAYMENT_RECEIVER_ADDRESS === "0x0000000000000000000000000000000000000000") {
      alert("Payment receiver address is not configured. Please set NEXT_PUBLIC_PAYMENT_RECEIVER_ADDRESS environment variable in Vercel.");
      return;
    }

    const amount = POST_COSTS[token];
    const decimals = token === "USDC" ? 6 : 18;

    try {
      writeContract({
        address: tokenAddress,
        abi: ERC20_ABI,
        functionName: "transfer",
        args: [PAYMENT_RECEIVER_ADDRESS, amount],
      });
    } catch (error) {
      console.error("Payment error:", error);
      alert("Payment failed. Please try again.");
    }
  }

  async function handleUpload() {
    if (!audioBlob) return;

    setUploading(true);
    try {
      // Upload to Supabase Storage
      const fileExt = "webm";
      const fileName = `${walletAddress}-${Date.now()}.${fileExt}`;
      const filePath = `voice-messages/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("voice-messages")
        .upload(filePath, audioBlob, {
          contentType: "audio/webm",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("voice-messages").getPublicUrl(filePath);

      // Get or create user
      let { data: user } = await supabase
        .from("users")
        .select("id")
        .eq("wallet_address", walletAddress)
        .single();

      if (!user) {
        const { data: newUser } = await supabase
          .from("users")
          .insert({ wallet_address: walletAddress })
          .select()
          .single();
        user = newUser;
      }

      if (!user) {
        throw new Error("Failed to get or create user");
      }

      // Determine payment token from transaction
      const paymentToken = "BLA"; // This should be determined from the transaction
      const paymentAmount = POST_COSTS[paymentToken].toString();

      // Save message to database
      const { error: dbError } = await supabase.from("voice_messages").insert({
        user_id: user.id,
        wallet_address: walletAddress,
        voice_url: publicUrl,
        is_anonymous: isAnonymous,
        payment_token: paymentToken,
        payment_amount: paymentAmount,
        transaction_hash: hash,
      });

      if (dbError) throw dbError;

      // Reset state
      setAudioBlob(null);
      setAudioUrl(null);
      setShowPaymentModal(false);
      onPostSuccess();
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload voice message. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  function cancelRecording() {
    isCancelingRef.current = true;
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
    }
    setIsRecording(false);
    setAudioBlob(null);
    setAudioUrl(null);
    setShowPaymentModal(false);
    chunksRef.current = [];
    usedTransactionHashRef.current = null;
  }

  return (
    <div className="space-y-4">
      {audioUrl && (
        <div className="bg-gray-700 rounded-lg p-4">
          <audio src={audioUrl} controls className="w-full mb-2" />
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
              />
              Post anonymously
            </label>
          </div>
        </div>
      )}

      {!isRecording && !audioUrl && (
        <button
          onClick={startRecording}
          className="w-full bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
        >
          <Mic className="w-5 h-5" />
          Record Voice Message
        </button>
      )}

      {isRecording && (
        <div className="flex items-center justify-center gap-4">
          <div className="flex items-center gap-2 text-red-500">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            Recording...
          </div>
          <button
            onClick={stopRecording}
            className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Stop & Post
          </button>
          <button
            onClick={cancelRecording}
            className="bg-gray-600 hover:bg-gray-700 px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      )}

      {(isPending || isConfirming || uploading) && (
        <div className="flex items-center justify-center gap-2 text-gray-400">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>
            {isPending || isConfirming ? "Processing payment..." : "Uploading..."}
          </span>
        </div>
      )}

      {showPaymentModal && audioBlob && !isPending && !isConfirming && (
        <PaymentModal
          onPayment={handlePayment}
          onClose={() => {
            setShowPaymentModal(false);
            cancelRecording();
          }}
        />
      )}
    </div>
  );
}





