# Supabase 작업 체크리스트

이 문서는 Blabla 프로젝트를 위해 Supabase에서 해야 할 모든 작업을 단계별로 정리한 가이드입니다.

## 📋 필수 작업 (Required)

### 1. ✅ 프로젝트 생성
- [ ] [Supabase](https://supabase.com)에 로그인
- [ ] **New Project** 클릭
- [ ] 프로젝트 이름 입력 (예: "Blabla")
- [ ] 데이터베이스 비밀번호 설정 (안전하게 저장!)
- [ ] 리전 선택 (가장 가까운 리전 권장)
- [ ] 프로젝트 생성 완료 대기 (약 2분 소요)

### 2. ✅ 데이터베이스 스키마 생성
- [ ] Supabase Dashboard에서 **SQL Editor** 메뉴 클릭
- [ ] **New Query** 클릭
- [ ] `lib/supabase/schema.sql` 파일의 전체 내용을 복사
- [ ] SQL Editor에 붙여넣기
- [ ] **Run** 버튼 클릭 (또는 `Ctrl+Enter`)
- [ ] 모든 테이블이 성공적으로 생성되었는지 확인

**생성되는 테이블:**
- `users` - 사용자 정보 (지갑 주소)
- `voice_messages` - 음성 메시지
- `reactions` - 반응/좋아요
- `bb_points` - BB 포인트
- `daily_claims` - 일일 클레임 기록
- `top_message_rewards` - 일일 상위 메시지 보상

### 3. ✅ Storage 버킷 생성
- [ ] Supabase Dashboard에서 **Storage** 메뉴 클릭
- [ ] **New bucket** 버튼 클릭
- [ ] 버킷 이름: `voice-messages` (정확히 이 이름으로!)
- [ ] **Public bucket** 체크박스 선택 ✅
- [ ] **Create bucket** 클릭

**중요:** 버킷 이름은 반드시 `voice-messages`여야 합니다!

### 4. ✅ Storage RLS 정책 설정 (선택사항)
Public bucket을 선택했다면 이 단계는 건너뛸 수 있습니다.

Public이 아닌 경우:
- [ ] Storage > Policies 메뉴로 이동
- [ ] `voice-messages` 버킷 선택
- [ ] 다음 정책 추가:

```sql
-- 모든 사용자가 파일 읽기 가능
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT USING (bucket_id = 'voice-messages');

-- 인증된 사용자만 파일 업로드
CREATE POLICY "Authenticated users can upload" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'voice-messages' AND
  auth.role() = 'authenticated'
);
```

### 5. ✅ API 키 확인
- [ ] Supabase Dashboard에서 **Settings** > **API** 메뉴 클릭
- [ ] 다음 값들을 복사하여 저장:

| 변수명 | 위치 | 설명 |
|--------|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL | 프로젝트 URL (예: `https://xxxxx.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon public | 공개 키 (클라이언트에서 사용) |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role | 서비스 역할 키 (서버 전용, 절대 공개 금지!) |

⚠️ **주의:** `SUPABASE_SERVICE_ROLE_KEY`는 절대 공개하지 마세요! 서버 사이드에서만 사용합니다.

### 6. ✅ Row Level Security (RLS) 확인
- [ ] 각 테이블의 **Authentication** > **Policies** 섹션 확인
- [ ] 현재 모든 테이블에 "UNRESTRICTED" 배지가 보이면 RLS가 비활성화된 상태
- [ ] 프로덕션 배포 전에 RLS 정책을 설정하는 것을 권장

**현재 상태:** 
- 개발 단계에서는 RLS를 비활성화해도 작동합니다
- 프로덕션에서는 보안을 위해 RLS를 활성화하고 정책을 설정하세요

---

## 🔧 선택적 작업 (Optional)

### 7. Realtime 활성화 (선택사항)
실시간 업데이트가 필요한 테이블에 대해:

- [ ] **Table Editor**에서 테이블 선택
- [ ] **Enable Realtime** 버튼 클릭
- [ ] 다음 테이블에 권장:
  - `voice_messages` - 새 메시지 실시간 표시
  - `reactions` - 반응 실시간 업데이트

### 8. 인덱스 확인
스키마 SQL을 실행하면 자동으로 인덱스가 생성됩니다. 확인:

- [ ] **Database** > **Indexes** 메뉴에서 인덱스 확인
- [ ] 다음 인덱스들이 있는지 확인:
  - `idx_voice_messages_created_at`
  - `idx_voice_messages_wallet`
  - `idx_reactions_message_id`
  - `idx_reactions_wallet`
  - `idx_bb_points_wallet`
  - `idx_daily_claims_wallet_date`
  - `idx_top_message_rewards_date`

### 9. Storage 파일 크기 제한 설정
- [ ] **Storage** > **Settings** 메뉴로 이동
- [ ] **File size limit** 설정 (권장: 10MB)
- [ ] 음성 파일은 보통 1-5MB 정도이므로 10MB면 충분합니다

### 10. CORS 설정 (필요한 경우)
다른 도메인에서 Storage에 접근해야 하는 경우:

- [ ] **Storage** > **Settings** 메뉴로 이동
- [ ] **CORS** 설정에서 허용할 도메인 추가
- [ ] 일반적으로 Vercel 배포 URL 추가

---

## 🧪 테스트

### 11. 데이터베이스 연결 테스트
- [ ] **Table Editor**에서 `users` 테이블 선택
- [ ] **Insert row** 클릭
- [ ] 샘플 데이터 입력:
  - `wallet_address`: `0x1234567890123456789012345678901234567890`
- [ ] **Save** 클릭
- [ ] 데이터가 정상적으로 저장되는지 확인

### 12. Storage 업로드 테스트
- [ ] **Storage** > **voice-messages** 버킷 선택
- [ ] **Upload file** 클릭
- [ ] 작은 테스트 파일 업로드
- [ ] 파일이 정상적으로 업로드되는지 확인
- [ ] Public URL이 생성되는지 확인

### 13. Foreign Key 관계 확인
- [ ] **Table Editor**에서 `voice_messages` 테이블 선택
- [ ] `user_id` 컬럼이 `users` 테이블을 참조하는지 확인
- [ ] `reactions` 테이블의 `message_id`가 `voice_messages`를 참조하는지 확인

---

## 🔐 보안 설정 (프로덕션)

### 14. RLS 정책 설정 (프로덕션 권장)
프로덕션 배포 전에 반드시 설정하세요:

#### users 테이블
```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 자신의 정보를 읽을 수 있음
CREATE POLICY "Users can read own profile" ON users
  FOR SELECT USING (wallet_address = current_setting('app.current_wallet', true));

-- 모든 사용자가 자신의 정보를 업데이트할 수 있음
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (wallet_address = current_setting('app.current_wallet', true));
```

#### voice_messages 테이블
```sql
ALTER TABLE voice_messages ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 음성 메시지를 읽을 수 있음 (공개)
CREATE POLICY "Anyone can read voice messages" ON voice_messages
  FOR SELECT USING (true);

-- 사용자가 자신의 메시지를 생성할 수 있음
CREATE POLICY "Users can insert own messages" ON voice_messages
  FOR INSERT WITH CHECK (wallet_address = current_setting('app.current_wallet', true));
```

#### reactions 테이블
```sql
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 반응을 읽을 수 있음
CREATE POLICY "Anyone can read reactions" ON reactions
  FOR SELECT USING (true);

-- 사용자가 반응을 생성할 수 있음
CREATE POLICY "Users can insert own reactions" ON reactions
  FOR INSERT WITH CHECK (wallet_address = current_setting('app.current_wallet', true));
```

**참고:** 현재 프로젝트는 wallet_address 기반 인증을 사용하므로, 실제 구현 시 세션 관리가 필요할 수 있습니다.

---

## 📊 모니터링 설정 (선택사항)

### 15. 로그 확인
- [ ] **Logs** 메뉴에서 API 요청 로그 확인
- [ ] 에러가 발생하는지 확인
- [ ] 느린 쿼리가 있는지 확인

### 16. 백업 설정 (Pro 플랜 이상)
- [ ] **Settings** > **Database** > **Backups** 메뉴 확인
- [ ] 자동 백업이 활성화되어 있는지 확인
- [ ] 필요시 수동 백업 설정

---

## ✅ 완료 확인

모든 작업을 완료했는지 확인하세요:

- [ ] Supabase 프로젝트 생성 완료
- [ ] 데이터베이스 스키마 실행 완료 (모든 테이블 생성됨)
- [ ] `voice-messages` Storage 버킷 생성 완료 (Public)
- [ ] API 키 확인 및 저장 완료
- [ ] 테스트 데이터 삽입 성공
- [ ] Storage 파일 업로드 테스트 성공
- [ ] 환경 변수 설정 완료 (`.env.local` 또는 Vercel)

---

## 🆘 문제 해결

### SQL 실행 오류
- **"relation already exists"**: 테이블이 이미 존재합니다. `DROP TABLE` 후 다시 실행하거나, `CREATE TABLE IF NOT EXISTS`를 사용하세요.
- **"permission denied"**: 프로젝트 소유자인지 확인하세요.

### Storage 업로드 실패
- 버킷 이름이 정확히 `voice-messages`인지 확인
- 버킷이 Public으로 설정되어 있는지 확인
- 파일 크기가 제한을 초과하지 않는지 확인

### 연결 오류
- API 키가 올바른지 확인
- Supabase 프로젝트가 활성화되어 있는지 확인
- 네트워크 연결 확인

---

## 📚 다음 단계

Supabase 설정이 완료되면:

1. **환경 변수 설정**: `.env.local` 파일에 Supabase 키 추가
2. **로컬 테스트**: `npm run dev`로 개발 서버 실행
3. **Vercel 배포**: 환경 변수를 Vercel에 추가하고 배포
4. **프로덕션 RLS 설정**: 보안을 위해 RLS 정책 활성화

---

**참고 문서:**
- `SETUP.md` - 전체 설정 가이드
- `VERCEL_ENV_VARS.md` - Vercel 환경 변수 설정
- `lib/supabase/schema.sql` - 데이터베이스 스키마
