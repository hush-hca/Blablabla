/**
 * Farcaster Mini App Embed 유틸리티
 * https://miniapps.farcaster.xyz/docs/specification/mini-app-embed
 */

export interface MiniAppEmbedButton {
  title: string;
  action: {
    type: "launch_frame";
    name: string;
    url: string;
  };
}

export interface MiniAppEmbed {
  version: string;
  imageUrl: string; // 필수: image 대신 imageUrl 사용
  actionUrl: string;
  button: MiniAppEmbedButton; // 필수
  title?: string;
  description?: string;
  splashImage?: string;
  splashBackgroundColor?: string;
}

/**
 * Base URL 정리 (마지막 슬래시 제거)
 */
function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.replace(/\/$/, "");
}

/**
 * Mini App Embed JSON을 메타태그용 문자열로 변환
 */
export function createEmbedMetaTag(embed: MiniAppEmbed): string {
  return JSON.stringify(embed);
}

/**
 * 기본 홈페이지 Embed 설정
 */
export function getHomeEmbed(baseUrl: string): MiniAppEmbed {
  const normalizedUrl = normalizeBaseUrl(baseUrl);
  return {
    version: "1",
    imageUrl: `${normalizedUrl}/embed-image.png`, // 3:2 비율 이미지 필요
    actionUrl: `${normalizedUrl}/`,
    button: {
      title: "Open Blabla",
      action: {
        type: "launch_frame",
        name: "Blabla",
        url: `${normalizedUrl}/`,
      },
    },
    title: "Blabla - Anonymous Voice Sharing",
    description: "Share your bear market feelings anonymously with voice messages",
    splashImage: `${normalizedUrl}/splash-image.png`, // 선택사항
    splashBackgroundColor: "#000000", // 검은색 배경
  };
}

/**
 * 메시지 페이지 Embed 설정
 */
export function getMessageEmbed(baseUrl: string, messageId: string): MiniAppEmbed {
  const normalizedUrl = normalizeBaseUrl(baseUrl);
  return {
    version: "1",
    imageUrl: `${normalizedUrl}/embed-image.png`,
    actionUrl: `${normalizedUrl}/message/${messageId}`,
    button: {
      title: "View Message",
      action: {
        type: "launch_frame",
        name: "Blabla",
        url: `${normalizedUrl}/message/${messageId}`,
      },
    },
    title: "Blabla - Voice Message",
    description: "Listen to this anonymous voice message",
    splashImage: `${normalizedUrl}/splash-image.png`,
    splashBackgroundColor: "#000000",
  };
}
