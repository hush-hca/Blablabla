# Vercel Environment Variables 설정 가이드

이 문서는 Vercel에 배포할 때 등록해야 하는 환경 변수 목록입니다.

## 📋 Vercel 설정 방법

1. Vercel Dashboard에서 프로젝트 선택
2. **Settings** → **Environment Variables** 메뉴로 이동
3. 아래 변수들을 하나씩 추가
4. 각 변수에 대해 **Production**, **Preview**, **Development** 환경을 선택
5. **Save** 클릭

---

## ✅ 필수 환경 변수 (Required)

다음 변수들은 반드시 설정해야 합니다:

### 1. Supabase 설정

| 변수명 | 설명 | 예시 값 |
|--------|------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL | `https://xxxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Anon (Public) Key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Service Role Key (서버 전용) | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |

**어디서 찾나요?**
- Supabase Dashboard → **Settings** → **API**
- Project URL → `NEXT_PUBLIC_SUPABASE_URL`
- anon public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- service_role key → `SUPABASE_SERVICE_ROLE_KEY` ⚠️ **절대 공개하지 마세요!**

### 2. 네트워크 설정

| 변수명 | 설명 | 메인넷 값 | 테스트넷 값 |
|--------|------|-----------|-------------|
| `NEXT_PUBLIC_NETWORK` | 네트워크 타입 | `mainnet` (또는 생략) | `testnet` |
| `NEXT_PUBLIC_CHAIN_ID` | 체인 ID | `8453` | `84532` |
| `NEXT_PUBLIC_RPC_URL` | RPC 엔드포인트 | `https://mainnet.base.org` | `https://sepolia.base.org` |

### 3. 토큰 컨트랙트 주소

| 변수명 | 설명 | 메인넷 값 | 테스트넷 값 |
|--------|------|-----------|-------------|
| `NEXT_PUBLIC_BLA_TOKEN` | BLA 토큰 주소 | Hunt.Town에서 발급받은 주소 | 배포한 테스트 토큰 주소 |
| `NEXT_PUBLIC_HUNT_TOKEN` | HUNT 토큰 주소 | `0x37f0c2915CeCcE7e977183B8543Fc0864d03e064C` | 배포한 테스트 토큰 주소 |
| `NEXT_PUBLIC_USDC_TOKEN` | USDC 토큰 주소 | `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` | `0x036CbD53842c5426634e7929541eC2318f3dCF7e` |

### 4. 결제 수신 주소

| 변수명 | 설명 | 예시 |
|--------|------|------|
| `NEXT_PUBLIC_PAYMENT_RECEIVER_ADDRESS` | 결제를 받을 지갑 주소 | `0x1234567890123456789012345678901234567890` |

⚠️ **중요**: 이 주소는 실제로 결제를 받을 지갑 주소여야 합니다. 테스트넷에서는 테스트 지갑 주소를 사용하세요.

### 5. 앱 URL

| 변수명 | 설명 | 예시 |
|--------|------|------|
| `NEXT_PUBLIC_APP_URL` | 프로덕션 앱 URL | `https://your-app.vercel.app` |

**Vercel 배포 후 자동 생성된 URL을 사용하세요.**

---

## 🔧 선택적 환경 변수 (Optional)

다음 변수들은 기본값이 있거나 선택적으로 사용할 수 있습니다:

### 1. WalletConnect 설정

| 변수명 | 설명 | 기본값 |
|--------|------|--------|
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | WalletConnect Project ID | `your-project-id` |

**어디서 찾나요?**
- [WalletConnect Cloud](https://cloud.walletconnect.com/)에서 프로젝트 생성
- Project ID 복사

### 2. 게시 비용 설정

| 변수명 | 설명 | 기본값 |
|--------|------|--------|
| `NEXT_PUBLIC_POST_COST_BLA` | BLA 토큰으로 게시하는 비용 | `10` |
| `NEXT_PUBLIC_POST_COST_HUNT` | HUNT 토큰으로 게시하는 비용 | `5` |
| `NEXT_PUBLIC_POST_COST_USDC` | USDC 토큰으로 게시하는 비용 | `1` |

### 3. 포인트 시스템 설정

| 변수명 | 설명 | 기본값 |
|--------|------|--------|
| `NEXT_PUBLIC_REACTION_POINTS` | 반응(좋아요) 시 받는 포인트 | `100` |
| `NEXT_PUBLIC_POINTS_TO_BLA_RATE` | 포인트를 BLA로 환전하는 비율 | `1000` |

### 4. Cron Job 보안

| 변수명 | 설명 | 기본값 |
|--------|------|--------|
| `CRON_SECRET` | 일일 보상 Cron Job 인증용 시크릿 | 없음 (설정 시 인증 필요) |

**권장**: 프로덕션에서는 반드시 설정하세요. 랜덤한 긴 문자열을 생성하여 사용하세요.

### 5. Farcaster 설정 (선택사항)

| 변수명 | 설명 | 기본값 |
|--------|------|--------|
| `NEXT_PUBLIC_FARCASTER_DEVELOPER_MNEMONIC` | Farcaster 개발자 니모닉 | 없음 |
| `NEXT_PUBLIC_FARCASTER_APP_FID` | Farcaster App FID | 없음 |

---

## 📝 환경별 설정 예시

### 프로덕션 (Production)

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Network (Mainnet)
NEXT_PUBLIC_NETWORK=mainnet
NEXT_PUBLIC_CHAIN_ID=8453
NEXT_PUBLIC_RPC_URL=https://mainnet.base.org

# Tokens (Mainnet)
NEXT_PUBLIC_BLA_TOKEN=0xYourBlaTokenAddress
NEXT_PUBLIC_HUNT_TOKEN=0x37f0c2915CeCcE7e977183B8543Fc0864d03e064C
NEXT_PUBLIC_USDC_TOKEN=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913

# Payment
NEXT_PUBLIC_PAYMENT_RECEIVER_ADDRESS=0xYourPaymentReceiverAddress

# App
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app

# Optional
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your-walletconnect-project-id
CRON_SECRET=your-random-secret-string
```

### 테스트넷 (Testnet)

```env
# Supabase (동일)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Network (Testnet)
NEXT_PUBLIC_NETWORK=testnet
NEXT_PUBLIC_CHAIN_ID=84532
NEXT_PUBLIC_RPC_URL=https://sepolia.base.org

# Tokens (Testnet)
NEXT_PUBLIC_BLA_TOKEN=0xYourTestBlaTokenAddress
NEXT_PUBLIC_HUNT_TOKEN=0xYourTestHuntTokenAddress
NEXT_PUBLIC_USDC_TOKEN=0x036CbD53842c5426634e7929541eC2318f3dCF7e

# Payment (Test Wallet)
NEXT_PUBLIC_PAYMENT_RECEIVER_ADDRESS=0xYourTestWalletAddress

# App
NEXT_PUBLIC_APP_URL=https://your-app-test.vercel.app
```

---

## ✅ 체크리스트

배포 전에 다음을 확인하세요:

### 필수 확인사항

- [ ] `NEXT_PUBLIC_SUPABASE_URL` 설정됨
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` 설정됨
- [ ] `SUPABASE_SERVICE_ROLE_KEY` 설정됨
- [ ] `NEXT_PUBLIC_BLA_TOKEN` 설정됨 (메인넷 주소)
- [ ] `NEXT_PUBLIC_PAYMENT_RECEIVER_ADDRESS` 설정됨
- [ ] `NEXT_PUBLIC_APP_URL` 설정됨 (Vercel 배포 URL)
- [ ] `NEXT_PUBLIC_NETWORK` 설정됨 (`mainnet` 또는 `testnet`)
- [ ] `NEXT_PUBLIC_CHAIN_ID` 설정됨
- [ ] `NEXT_PUBLIC_RPC_URL` 설정됨

### 권장 확인사항

- [ ] `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` 설정됨
- [ ] `CRON_SECRET` 설정됨 (프로덕션)
- [ ] 모든 환경 변수가 올바른 환경(Production/Preview/Development)에 설정됨

---

## 🚨 주의사항

1. **`SUPABASE_SERVICE_ROLE_KEY`는 절대 공개하지 마세요!**
   - 이 키는 서버에서만 사용해야 합니다
   - 클라이언트 코드에 노출되면 안 됩니다
   - Vercel에서는 자동으로 서버 사이드에서만 접근 가능합니다

2. **`NEXT_PUBLIC_` 접두사**
   - `NEXT_PUBLIC_`로 시작하는 변수는 클라이언트에서도 접근 가능합니다
   - 민감한 정보는 이 접두사를 사용하지 마세요

3. **환경별 설정**
   - Production, Preview, Development 환경에 따라 다른 값을 설정할 수 있습니다
   - 테스트넷과 메인넷을 구분하여 설정하세요

4. **변경 후 재배포**
   - 환경 변수를 변경한 후에는 Vercel에서 **Redeploy**가 필요합니다
   - Settings에서 변경 후 자동으로 재배포되거나, 수동으로 재배포하세요

---

## 🔍 문제 해결

### 환경 변수가 적용되지 않는 경우

1. **재배포 확인**: 환경 변수 변경 후 재배포했는지 확인
2. **변수명 확인**: 대소문자와 언더스코어(`_`)가 정확한지 확인
3. **환경 확인**: Production/Preview/Development 중 올바른 환경에 설정했는지 확인
4. **빌드 로그 확인**: Vercel 배포 로그에서 환경 변수 로드 여부 확인

### Supabase 연결 오류

- `NEXT_PUBLIC_SUPABASE_URL`과 `NEXT_PUBLIC_SUPABASE_ANON_KEY`가 올바른지 확인
- Supabase Dashboard에서 프로젝트가 활성화되어 있는지 확인

### Web3 연결 오류

- `NEXT_PUBLIC_CHAIN_ID`와 `NEXT_PUBLIC_RPC_URL`이 올바른지 확인
- RPC URL이 접근 가능한지 확인

---

## 📚 참고 자료

- [Vercel Environment Variables 문서](https://vercel.com/docs/concepts/projects/environment-variables)
- [Next.js Environment Variables 문서](https://nextjs.org/docs/basic-features/environment-variables)
- [Supabase 설정 가이드](./SUPABASE_SETUP.md)
- [프로젝트 설정 가이드](./SETUP.md)
