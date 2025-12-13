# 빠른 시작 가이드 (Quick Start)

## 1. 환경 변수 파일 생성

프로젝트 루트에 `.env.local` 파일을 생성하세요:

```bash
# Windows (PowerShell)
Copy-Item .env.local.example .env.local

# Mac/Linux
cp .env.local.example .env.local
```

또는 수동으로 `.env.local` 파일을 만들고 아래 내용을 추가하세요:

```env
# 최소한 필요한 환경 변수
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_PAYMENT_RECEIVER_ADDRESS=0x0000000000000000000000000000000000000000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 2. Supabase 설정

1. [Supabase](https://supabase.com)에서 새 프로젝트 생성
2. Settings > API에서 다음 값 복사:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - service_role key → `SUPABASE_SERVICE_ROLE_KEY`
3. SQL Editor에서 `lib/supabase/schema.sql` 실행
4. Storage에서 `voice-messages` 버킷 생성 (public)

## 3. 개발 서버 실행

```bash
npm install
npm run dev
```

브라우저에서 http://localhost:3000 열기

## 문제 해결

### "supabaseUrl is required" 오류
→ `.env.local` 파일이 없거나 환경 변수가 설정되지 않았습니다.
→ 위의 1번 단계를 따라 `.env.local` 파일을 생성하세요.

### 다른 오류가 발생하면
→ `SETUP.md` 파일을 참고하세요.

## 테스트넷에서 테스트하기

메인넷에 배포하기 전에 테스트넷에서 테스트하는 것을 강력히 권장합니다.

→ `TESTNET_SETUP.md` 파일을 참고하세요.



