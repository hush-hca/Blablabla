"use client";

import { useEffect } from "react";
import { getHomeEmbed, getMessageEmbed, createEmbedMetaTag } from "@/lib/farcaster-embed";
import { usePathname } from "next/navigation";

interface MiniAppEmbedProps {
  messageId?: string;
}

export function MiniAppEmbed({ messageId }: MiniAppEmbedProps) {
  const pathname = usePathname();
  
  useEffect(() => {
    // Base URL 가져오기
    const baseUrl = typeof window !== "undefined" 
      ? `${window.location.protocol}//${window.location.host}`
      : process.env.NEXT_PUBLIC_APP_URL || "";

    // 경로에 따라 적절한 embed 생성
    let embed;
    if (messageId) {
      embed = getMessageEmbed(baseUrl, messageId);
    } else {
      embed = getHomeEmbed(baseUrl);
    }

    const embedContent = createEmbedMetaTag(embed);

    // 기존 메타태그 제거
    const existingMeta = document.querySelector('meta[name="fc:miniapp"]');
    if (existingMeta) {
      existingMeta.remove();
    }

    // 새 메타태그 추가
    const metaTag = document.createElement("meta");
    metaTag.name = "fc:miniapp";
    metaTag.content = embedContent;
    document.head.appendChild(metaTag);

    // Open Graph 메타태그도 추가 (선택사항)
    const ogImage = document.querySelector('meta[property="og:image"]');
    if (!ogImage) {
      const ogMeta = document.createElement("meta");
      ogMeta.setAttribute("property", "og:image");
      ogMeta.content = embed.image;
      document.head.appendChild(ogMeta);
    }

    return () => {
      // Cleanup
      const meta = document.querySelector('meta[name="fc:miniapp"]');
      if (meta) {
        meta.remove();
      }
    };
  }, [pathname, messageId]);

  return null;
}
