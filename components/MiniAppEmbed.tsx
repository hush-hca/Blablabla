"use client";

import { useEffect, useRef } from "react";
import { getHomeEmbed, getMessageEmbed, createEmbedMetaTag } from "@/lib/farcaster-embed";
import { usePathname } from "next/navigation";

interface MiniAppEmbedProps {
  messageId?: string;
}

export function MiniAppEmbed({ messageId }: MiniAppEmbedProps) {
  const pathname = usePathname();
  const metaTagRef = useRef<HTMLMetaElement | null>(null);
  const ogMetaTagRef = useRef<HTMLMetaElement | null>(null);
  
  useEffect(() => {
    // SSR 환경에서는 실행하지 않음
    if (typeof window === "undefined" || !document.head) {
      return;
    }

    try {
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

      // document.head가 존재하는지 확인
      if (!document.head) {
        console.warn("document.head is not available");
        return;
      }

      // 기존 메타태그 제거 (ref로 추적한 것만)
      if (metaTagRef.current && metaTagRef.current.parentNode) {
        try {
          metaTagRef.current.remove();
        } catch (e) {
          // 이미 제거되었거나 오류가 발생한 경우 무시
        }
      }

      // 새 메타태그 추가
      const metaTag = document.createElement("meta");
      metaTag.name = "fc:miniapp";
      metaTag.content = embedContent;
      
      if (document.head) {
        document.head.appendChild(metaTag);
        metaTagRef.current = metaTag;
      }

      // Open Graph 메타태그도 추가 (선택사항)
      const ogImage = document.querySelector('meta[property="og:image"]');
      if (!ogImage && document.head) {
        // 기존 OG 메타태그 제거 (ref로 추적한 것만)
        if (ogMetaTagRef.current && ogMetaTagRef.current.parentNode) {
          try {
            ogMetaTagRef.current.remove();
          } catch (e) {
            // 무시
          }
        }

        const ogMeta = document.createElement("meta");
        ogMeta.setAttribute("property", "og:image");
        ogMeta.content = embed.imageUrl;
        document.head.appendChild(ogMeta);
        ogMetaTagRef.current = ogMeta;
      }
    } catch (error) {
      console.error("Error setting up Mini App Embed:", error);
    }

    // Cleanup 함수 제거됨 - 메타태그는 페이지 변경 시 업데이트만 하면 되며,
    // React unmount 시 자동으로 정리되므로 수동 제거가 필요 없습니다.
    // cleanup 함수가 React의 내부 DOM 관리와 충돌하여 removeChild 오류를 발생시킬 수 있습니다.
  }, [pathname, messageId]);

  return null;
}
