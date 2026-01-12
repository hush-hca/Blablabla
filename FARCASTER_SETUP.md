# Farcaster Mini App 등록 및 Embed 설정 가이드

## 📋 완료된 작업

✅ Mini App Embed 메타태그 추가 (`fc:miniapp`)
✅ SDK `ready()` 호출 추가
✅ 각 페이지별 동적 embed 설정
✅ Quick Auth preconnect 최적화

## 🖼️ 필요한 이미지 제작

### 1. Embed Image (`/public/embed-image.png`)

**용도**: Farcaster 피드에서 Mini App이 표시될 때 보이는 이미지

**요구사항**:
- **비율**: 3:2 (예: 1200x800px, 1500x1000px)
- **형식**: PNG 또는 JPG
- **크기**: 최소 1200x800px 권장
- **내용**: 
  - Blabla 로고 또는 브랜딩
  - "Anonymous Voice Sharing" 텍스트
  - 어두운 배경 (앱 테마와 일치)
  - 시각적으로 매력적인 디자인


### 2. Splash Image (`/public/splash-image.png`) - 선택사항

**용도**: Mini App이 열릴 때 표시되는 스플래시 화면

**요구사항**:
- **비율**: 1:1 또는 3:2
- **형식**: PNG (투명 배경 가능)
- **크기**: 최소 512x512px
- **내용**: 
  - Blabla 로고
  - 로딩 애니메이션용으로 사용 가능

**참고**: Splash image는 선택사항입니다. 제공하지 않으면 배경색만 표시됩니다.

## 📝 이미지 제작 체크리스트

- [ ] `embed-image.png` (3:2 비율, 1200x800px 이상)
- [ ] `splash-image.png` (선택사항, 512x512px 이상)
- [ ] 이미지를 `/public` 폴더에 저장
- [ ] 이미지 파일명이 정확한지 확인

## 🔧 환경 변수 설정

`.env.local` 파일에 다음 변수를 추가하세요:

```bash
# Farcaster Mini App Base URL
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

**중요**: 
- 프로덕션 도메인을 사용해야 합니다
- `https://` 프로토콜 포함
- 마지막에 `/` 없이 설정

## 📱 Farcaster Mini App 등록 절차

### 1. Developer Mode 활성화

1. Farcaster에 로그인 (모바일 또는 데스크톱)
2. [Developer Tools 설정](https://farcaster.xyz/~/settings/developer-tools) 접속
3. "Developer Mode" 토글 활성화
4. 데스크톱에서 개발자 섹션이 왼쪽에 표시되는지 확인

### 2. Manifest 생성

1. [Manifest Tool](https://farcaster.xyz/~/developer/manifest) 접속
2. 다음 정보 입력:
   - **App Name**: Blabla
   - **App URL**: `https://your-domain.vercel.app`
   - **Icon**: 앱 아이콘 이미지 (512x512px 권장)
   - **Description**: "Anonymous voice sharing for bear market feelings"
   - **Splash Image**: `/public/splash-image.png` (선택사항)
   - **Splash Background Color**: `#000000` (검은색)

3. Manifest 생성 후 저장

### 3. Account Association 설정

`.well-known/farcaster.json` 파일이 이미 설정되어 있습니다. 

**확인 사항**:
- 파일이 프로덕션 도메인에서 접근 가능한지 확인
- `https://your-domain.vercel.app/.well-known/farcaster.json` 접속 테스트

### 4. Mini App 게시

1. [Publishing 페이지](https://farcaster.xyz/~/developer/publish) 접속
2. 생성한 Manifest 선택
3. "Publish" 클릭
4. 검토 후 승인 대기

### 5. Embed 테스트

1. [Preview Tool](https://farcaster.xyz/~/developer/preview) 사용
2. 앱 URL 입력하여 미리보기 확인
3. [Embed Debug Tool](https://farcaster.xyz/~/developer/embed-debug)로 메타태그 검증

## 🔍 검증 체크리스트

배포 전 확인:

- [ ] `NEXT_PUBLIC_APP_URL` 환경변수 설정
- [ ] `/public/embed-image.png` 파일 존재
- [ ] `/public/splash-image.png` 파일 존재 (선택사항)
- [ ] `.well-known/farcaster.json` 접근 가능
- [ ] 메타태그가 올바르게 설정되었는지 확인
- [ ] SDK `ready()` 호출 확인
- [ ] 프로덕션 도메인에서 테스트

## 🧪 로컬 테스트

로컬에서 메타태그 확인:

```bash
# 개발 서버 실행
npm run dev

# 브라우저에서 확인
# http://localhost:3000 접속 후 개발자 도구 > Elements에서
# <meta name="fc:miniapp" content="..."> 태그 확인
```

## 📚 참고 자료

- [Farcaster Mini Apps 문서](https://miniapps.farcaster.xyz)
- [Mini App Embed 스펙](https://miniapps.farcaster.xyz/docs/specification/mini-app-embed)
- [Publishing 가이드](https://miniapps.farcaster.xyz/docs/guides/publishing)
- [AI Agent Checklist](https://miniapps.farcaster.xyz/docs/guides/agents-checklist)

## ⚠️ 주의사항

1. **프로덕션 도메인 필수**: Mini App은 프로덕션 도메인에서만 정상 작동합니다
2. **HTTPS 필수**: 모든 URL은 `https://`로 시작해야 합니다
3. **이미지 최적화**: 큰 이미지는 로딩 시간을 늘릴 수 있으니 적절히 최적화하세요
4. **SDK ready()**: 앱이 로드되면 반드시 `sdk.actions.ready()`를 호출해야 합니다

## 🎨 이미지 제작 도구 추천

- **Figma**: 무료, 웹 기반 디자인 도구
- **Canva**: 템플릿 기반 빠른 제작
- **Photoshop/GIMP**: 전문적인 이미지 편집
- **Midjourney/DALL-E**: AI 이미지 생성 (로고/아이콘용)

## 📞 문제 해결

### 메타태그가 표시되지 않는 경우
- 브라우저 개발자 도구에서 `<head>` 섹션 확인
- `NEXT_PUBLIC_APP_URL` 환경변수 확인
- 빌드 후 확인 (개발 모드와 프로덕션 모드 차이 가능)

### Embed가 작동하지 않는 경우
- 프로덕션 도메인에서 테스트했는지 확인
- Manifest가 올바르게 생성되었는지 확인
- Account Association이 설정되었는지 확인

### SDK ready() 오류
- `@farcaster/miniapp-sdk` 패키지가 설치되었는지 확인
- Farcaster 클라이언트 내에서만 작동 (일반 브라우저에서는 오류 가능)
