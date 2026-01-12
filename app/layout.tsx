import type { Metadata } from "next";
import React from "react";
import "./globals.css";
import { Providers } from "./providers";
import { getHomeEmbed, createEmbedMetaTag } from "@/lib/farcaster-embed";

// Base URL 설정 (환경변수 또는 기본값)
const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://blablabla-uo17.vercel.app/";
const homeEmbed = getHomeEmbed(baseUrl);

export const metadata: Metadata = {
  title: "Blabla - Anonymous Voice Sharing",
  description: "Share your bear market feelings anonymously",
  other: {
    "fc:miniapp": createEmbedMetaTag(homeEmbed),
  },
  openGraph: {
    title: "Blabla - Anonymous Voice Sharing",
    description: "Share your bear market feelings anonymously with voice messages",
    images: [homeEmbed.image],
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Preconnect to Quick Auth for better performance */}
        <link rel="preconnect" href="https://auth.farcaster.xyz" />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
