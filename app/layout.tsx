import type { Metadata } from "next";
import "./globals.css";
import dynamic from "next/dynamic";

// Providers를 동적 import하여 서버에서 번들링되지 않도록 함
const Providers = dynamic(() => import("./providers").then((mod) => ({ default: mod.Providers })), {
  ssr: false,
});

export const metadata: Metadata = {
  title: "Blabla - Anonymous Voice Sharing",
  description: "Share your bear market feelings anonymously",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}




