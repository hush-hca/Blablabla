"use client";

import "@rainbow-me/rainbowkit/styles.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { config } from "@/lib/wagmi";
import { useState, useEffect } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Farcaster Mini App SDK 초기화 및 ready() 호출
    if (typeof window !== "undefined") {
      import("@farcaster/miniapp-sdk").then(({ sdk }) => {
        // 앱이 로드되면 splash screen 숨기기
        sdk.actions.ready().catch((error) => {
          // Farcaster 환경이 아닌 경우 에러는 무시 (일반 브라우저에서 실행 중)
          if (process.env.NODE_ENV === "development") {
            console.log("Farcaster SDK not available (running in browser):", error);
          }
        });
      }).catch(() => {
        // SDK가 없는 경우 무시 (일반 브라우저 환경)
      });
    }
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}





