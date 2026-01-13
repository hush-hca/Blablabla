# Embed Data 수정 완료 ✅

## 🔧 수정된 내용

1. ✅ **`image` → `imageUrl`로 변경**: Farcaster 스펙에 맞게 필수 필드 수정
2. ✅ **`button` 객체 추가**: 필수 필드인 button 추가
   - `title`: "Open Blabla" (홈페이지), "View Message" (메시지 페이지)
   - `action.type`: "launch_frame"
   - `action.name`: "Blabla"
   - `action.url`: 해당 페이지 URL
3. ✅ **이미지 파일명 수정**: `embed-image.png.png` → `embed-image.png`
4. ✅ **Base URL 정리**: 마지막 슬래시 자동 제거

## 📋 이제 해야 할 일

### 1. Vercel에 배포 (필수)

```bash
# 변경사항 커밋 및 푸시
git add .
git commit -m "Fix Farcaster Mini App Embed: add imageUrl and button"
git push
```

Vercel이 자동으로 배포합니다.

### 2. 배포 후 Embed 검증

배포가 완료되면:

1. **프로덕션 URL 확인**
   - `https://blablabla-uo17.vercel.app` 접속
   - 페이지 소스 보기 (View Source)
   - `<meta name="fc:miniapp" content="...">` 태그 확인

2. **Farcaster Embed Debug Tool 사용**
   - [Embed Debug Tool](https://farcaster.xyz/~/developer/embed-debug) 접속
   - 프로덕션 URL 입력: `https://blablabla-uo17.vercel.app`
   - 검증 결과 확인:
     - ✅ `version`: "1" (Valid)
     - ✅ `imageUrl`: 이미지 URL (Valid)
     - ✅ `button`: 버튼 설정 (Valid)
     - ✅ `aspectRatio`: 자동 계산됨

3. **이미지 접근 확인**
   - `https://blablabla-uo17.vercel.app/embed-image.png` 접속
   - 이미지가 정상적으로 표시되는지 확인
   - `https://blablabla-uo17.vercel.app/splash-image.png` 접속
   - 스플래시 이미지도 확인

### 3. 환경 변수 설정 (선택사항)

Vercel 대시보드에서 환경 변수 설정:

```
NEXT_PUBLIC_APP_URL=https://blablabla-uo17.vercel.app
```

**참고**: 이미 하드코딩된 기본값이 있으므로 필수는 아니지만, 나중에 도메인 변경 시 유용합니다.

### 4. Farcaster Mini App 등록

1. **Developer Mode 활성화** (아직 안 했다면)
   - [Developer Tools](https://farcaster.xyz/~/settings/developer-tools)
   - "Developer Mode" 토글 ON

2. **Manifest 생성/업데이트**
   - [Manifest Tool](https://farcaster.xyz/~/developer/manifest) 접속
   - 다음 정보 입력:
     - **App Name**: Blabla
     - **App URL**: `https://blablabla-uo17.vercel.app`
     - **Icon**: 512x512px 아이콘 이미지
     - **Description**: "Anonymous voice sharing for bear market feelings"
     - **Splash Image**: `https://blablabla-uo17.vercel.app/splash-image.png`
     - **Splash Background Color**: `#000000`

3. **Account Association 확인**
   - `.well-known/farcaster.json` 파일이 프로덕션에서 접근 가능한지 확인
   - `https://blablabla-uo17.vercel.app/.well-known/farcaster.json` 접속 테스트
   - 이미 설정되어 있다면 그대로 사용

4. **Mini App 게시**
   - [Publishing 페이지](https://farcaster.xyz/~/developer/publish) 접속
   - Manifest 선택 후 "Publish" 클릭

### 5. 테스트

1. **Preview Tool로 테스트**
   - [Preview Tool](https://farcaster.xyz/~/developer/preview) 접속
   - URL 입력: `https://blablabla-uo17.vercel.app`
   - 미리보기 확인

2. **실제 Farcaster에서 테스트**
   - Farcaster 클라이언트에서 앱 URL을 캐스트로 공유
   - Embed가 올바르게 표시되는지 확인
   - 버튼 클릭 시 앱이 정상적으로 열리는지 확인

## 🔍 문제 해결

### Embed Debug Tool에서 여전히 오류가 나는 경우

1. **캐시 문제**
   - 브라우저 캐시 삭제
   - Vercel 배포 후 몇 분 기다린 후 다시 시도

2. **이미지 접근 불가**
   - `https://blablabla-uo17.vercel.app/embed-image.png` 직접 접속
   - 404 오류가 나면 이미지 파일이 `/public` 폴더에 있는지 확인
   - Vercel 빌드 로그 확인

3. **메타태그가 보이지 않음**
   - 프로덕션 URL에서 페이지 소스 보기
   - `<meta name="fc:miniapp" content="...">` 태그 확인
   - 개발 모드와 프로덕션 모드 차이 가능

### 이미지가 표시되지 않는 경우

1. **파일명 확인**
   - `/public/embed-image.png` (정확한 파일명)
   - 대소문자 구분 확인

2. **이미지 형식 확인**
   - PNG, JPG, WebP 지원
   - 파일 크기가 너무 크지 않은지 확인 (최적화 권장)

3. **HTTPS 확인**
   - 모든 URL은 `https://`로 시작해야 함

## 📝 현재 Embed 구조

```json
{
  "version": "1",
  "imageUrl": "https://blablabla-uo17.vercel.app/embed-image.png",
  "actionUrl": "https://blablabla-uo17.vercel.app/",
  "button": {
    "title": "Open Blabla",
    "action": {
      "type": "launch_frame",
      "name": "Blabla",
      "url": "https://blablabla-uo17.vercel.app/"
    }
  },
  "title": "Blabla - Anonymous Voice Sharing",
  "description": "Share your bear market feelings anonymously with voice messages",
  "splashImage": "https://blablabla-uo17.vercel.app/splash-image.png",
  "splashBackgroundColor": "#000000"
}
```

## ✅ 체크리스트

배포 전:
- [x] 코드 수정 완료
- [x] 이미지 파일명 수정 완료
- [ ] Vercel에 배포
- [ ] Embed Debug Tool로 검증
- [ ] 이미지 접근 확인

등록 전:
- [ ] Developer Mode 활성화
- [ ] Manifest 생성/업데이트
- [ ] Account Association 확인
- [ ] Preview Tool로 테스트

등록 후:
- [ ] Mini App 게시
- [ ] 실제 Farcaster에서 테스트
- [ ] 모든 기능 정상 작동 확인
