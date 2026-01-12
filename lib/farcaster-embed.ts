/**
 * Farcaster Mini App Embed 유틸리티
 * https://miniapps.farcaster.xyz/docs/specification/mini-app-embed
 */

export interface MiniAppEmbed {
  version: string;
  image: string;
  actionUrl: string;
  title?: string;
  description?: string;
  splashImage?: string;
  splashBackgroundColor?: string;
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
  return {
    version: "1",
    image: `${baseUrl}/embed-image.png`, // 3:2 비율 이미지 필요
    actionUrl: `${baseUrl}/`,
    title: "Blabla - Anonymous Voice Sharing",
    description: "Share your bear market feelings anonymously with voice messages",
    splashImage: `${baseUrl}/splash-image.png`, // 선택사항
    splashBackgroundColor: "#000000", // 검은색 배경
  };
}

/**
 * 메시지 페이지 Embed 설정
 */
export function getMessageEmbed(baseUrl: string, messageId: string): MiniAppEmbed {
  return {
    version: "1",
    image: `${baseUrl}/embed-image.png`,
    actionUrl: `${baseUrl}/message/${messageId}`,
    title: "Blabla - Voice Message",
    description: "Listen to this anonymous voice message",
    splashImage: `${baseUrl}/splash-image.png`,
    splashBackgroundColor: "#000000",
  };
}
