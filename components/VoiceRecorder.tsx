"use client";

import { useState, useRef, useEffect } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
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
  const [selectedPaymentToken, setSelectedPaymentToken] = useState<"BLA" | "HUNT" | "USDC" | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const usedTransactionHashRef = useRef<string | null>(null);

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
      // Reset used transaction hash for new recording
      usedTransactionHashRef.current = null;
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Determine the best mimeType for the browser
      let mimeType = "audio/webm;codecs=opus";
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = "audio/webm";
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = "audio/mp4";
          if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = ""; // Use browser default
          }
        }
      }

      const options: MediaRecorderOptions = mimeType ? { mimeType } : {};
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
          console.log("Data chunk received:", event.data.size, "bytes");
        }
      };

      mediaRecorder.onstop = async () => {
        // Wait a bit to ensure all data is collected
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Determine the correct blob type based on what was actually recorded
        const recordedType = mediaRecorder.mimeType || "audio/webm";
        
        // Validate chunks
        if (chunksRef.current.length === 0) {
          console.error("No data chunks collected");
          alert("Recording failed. No audio data captured. Please try again.");
          return;
        }
        
        const totalSize = chunksRef.current.reduce((sum, chunk) => sum + chunk.size, 0);
        console.log("Total chunks:", chunksRef.current.length, "Total size:", totalSize, "bytes");
        
        if (totalSize === 0) {
          console.error("Recorded blob is empty");
          alert("Recording failed. Please try again.");
          return;
        }

        const blob = new Blob(chunksRef.current, { type: recordedType });
        
        // Validate final blob
        if (blob.size === 0) {
          console.error("Final blob is empty");
          alert("Recording failed. Please try again.");
          return;
        }

        console.log("Recording complete:", {
          blobSize: blob.size,
          blobType: blob.type,
          mimeType: recordedType,
        });

        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
      };

      mediaRecorder.onerror = (event) => {
        console.error("MediaRecorder error:", event);
        alert("Recording error occurred. Please try again.");
        setIsRecording(false);
      };

      // Start recording with timeslice to ensure data is available
      // Use smaller timeslice for more frequent data collection
      mediaRecorder.start(50); // Collect data every 50ms
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

    try {
      setSelectedPaymentToken(token);
      writeContract({
        address: tokenAddress,
        abi: ERC20_ABI,
        functionName: "transfer",
        args: [PAYMENT_RECEIVER_ADDRESS, amount],
      });
    } catch (error) {
      console.error("Payment error:", error);
      alert("Payment failed. Please try again.");
      setSelectedPaymentToken(null);
    }
  }

  async function handleUpload() {
    if (!audioBlob) {
      console.error("No audio blob to upload");
      alert("No audio recording found. Please record again.");
      return;
    }

    setUploading(true);
    try {
      // Validate blob
      if (audioBlob.size === 0) {
        throw new Error("Audio blob is empty. Please record again.");
      }

      console.log("Uploading audio blob:", {
        size: audioBlob.size,
        type: audioBlob.type,
      });

      // Determine file extension and content type from blob
      const blobType = audioBlob.type || "audio/webm";
      let fileExt = "webm";
      let contentType = "audio/webm";
      
      if (blobType.includes("webm")) {
        fileExt = "webm";
        contentType = "audio/webm";
      } else if (blobType.includes("mp4") || blobType.includes("m4a")) {
        fileExt = "m4a";
        contentType = "audio/mp4";
      } else if (blobType.includes("ogg")) {
        fileExt = "ogg";
        contentType = "audio/ogg";
      } else if (blobType.includes("wav")) {
        fileExt = "wav";
        contentType = "audio/wav";
      }

      const fileName = `${walletAddress}-${Date.now()}.${fileExt}`;
      // Don't include bucket name in path - .from() already specifies the bucket
      const filePath = fileName;

      console.log("Uploading file:", {
        fileName,
        filePath,
        contentType,
        size: audioBlob.size,
      });

      // Verify blob before upload
      console.log("Blob verification before upload:", {
        size: audioBlob.size,
        type: audioBlob.type,
        isBlob: audioBlob instanceof Blob,
      });

      // Create a fresh Blob to ensure integrity
      const uploadBlob = new Blob([audioBlob], { type: contentType });
      
      if (uploadBlob.size !== audioBlob.size) {
        console.warn("Blob size mismatch after recreation");
      }

      // Upload directly as Blob
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("voice-messages")
        .upload(filePath, uploadBlob, {
          contentType: contentType,
          upsert: false,
          cacheControl: "3600",
        });

      if (uploadError) {
        console.error("Upload error details:", {
          message: uploadError.message,
          statusCode: uploadError.statusCode,
          error: uploadError.error,
        });
        
        // Provide specific error messages
        if (uploadError.message?.includes("duplicate") || uploadError.statusCode === "409") {
          throw new Error("File already exists. Please try again.");
        } else if (uploadError.message?.includes("permission") || uploadError.statusCode === "403") {
          throw new Error("Permission denied. Please check Supabase Storage settings.");
        } else if (uploadError.message?.includes("size") || uploadError.statusCode === "413") {
          throw new Error("File too large. Please record a shorter message.");
        } else {
          throw new Error(`Upload failed: ${uploadError.message || "Unknown error"}`);
        }
      }

      if (!uploadData) {
        throw new Error("Upload returned no data");
      }

      console.log("Upload successful:", uploadData);

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("voice-messages").getPublicUrl(filePath);

      if (!publicUrl) {
        throw new Error("Failed to get public URL");
      }

      console.log("Public URL:", publicUrl);

      // Get or create user
      let { data: user, error: userError } = await supabase
        .from("users")
        .select("id")
        .eq("wallet_address", walletAddress)
        .single();

      if (userError && userError.code !== "PGRST116") {
        // PGRST116 is "not found" which is expected
        console.error("Error fetching user:", userError);
        throw new Error(`Failed to fetch user: ${userError.message}`);
      }

      if (!user) {
        console.log("Creating new user for wallet:", walletAddress);
        const { data: newUser, error: createError } = await supabase
          .from("users")
          .insert({ wallet_address: walletAddress })
          .select()
          .single();

        if (createError) {
          console.error("Error creating user:", createError);
          throw new Error(`Failed to create user: ${createError.message}`);
        }

        user = newUser;
      }

      if (!user || !user.id) {
        throw new Error("Failed to get or create user");
      }

      // Determine payment token from transaction
      const paymentToken = selectedPaymentToken || "BLA";
      const paymentAmount = POST_COSTS[paymentToken].toString();

      console.log("Saving message to database:", {
        user_id: user.id,
        voice_url: publicUrl,
        payment_token: paymentToken,
      });

      // Save message to database
      const { data: messageData, error: dbError } = await supabase
        .from("voice_messages")
        .insert({
          user_id: user.id,
          wallet_address: walletAddress,
          voice_url: publicUrl,
          is_anonymous: isAnonymous,
          payment_token: paymentToken,
          payment_amount: paymentAmount,
          transaction_hash: hash || null,
        })
        .select()
        .single();

      if (dbError) {
        console.error("Database error:", {
          message: dbError.message,
          code: dbError.code,
          details: dbError.details,
          hint: dbError.hint,
        });
        throw new Error(`Failed to save message: ${dbError.message || "Unknown error"}`);
      }

      if (!messageData) {
        throw new Error("Message saved but no data returned");
      }

      console.log("Message saved successfully:", messageData);

      // Reset state
      setAudioBlob(null);
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      setAudioUrl(null);
      setShowPaymentModal(false);
      setSelectedPaymentToken(null);
      onPostSuccess();
    } catch (error: any) {
      console.error("Upload error:", error);
      const errorMessage = error?.message || error?.toString() || "Unknown error occurred";
      alert(`Failed to upload voice message: ${errorMessage}\n\nPlease check the console for more details.`);
    } finally {
      setUploading(false);
    }
  }

  function cancelRecording() {
    if (mediaRecorderRef.current) {
      try {
        if (mediaRecorderRef.current.state !== "inactive") {
          mediaRecorderRef.current.stop();
        }
        mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      } catch (error) {
        console.error("Error stopping recorder:", error);
      }
    }
    setIsRecording(false);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioBlob(null);
    setAudioUrl(null);
    setShowPaymentModal(false);
    setSelectedPaymentToken(null);
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





