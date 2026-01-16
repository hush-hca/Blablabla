# Supabase 음성 업로드 문제 해결 가이드

## 🚨 즉시 확인해야 할 사항

### 1. Storage 버킷이 Public인지 확인

1. Supabase Dashboard → **Storage** 메뉴
2. `voice-messages` 버킷 선택
3. **Settings** 탭 확인:
   - **Public bucket**: ✅ **반드시 체크되어 있어야 함**
   - **File size limit**: 최소 10MB (권장: 50MB)

**Public이 아니면:**
- 버킷 삭제 후 다시 생성 (Public으로)
- 또는 버킷 Settings에서 Public으로 변경

### 2. Storage RLS 정책 설정 (필수!)

Supabase SQL Editor에서 실행:

```sql
-- 1. 기존 정책 확인 (선택사항)
SELECT * FROM pg_policies 
WHERE tablename = 'objects' 
AND policyname LIKE '%voice-messages%';

-- 2. 기존 정책 삭제 (필요한 경우)
DROP POLICY IF EXISTS "Public read access for voice-messages" ON storage.objects;
DROP POLICY IF EXISTS "Public upload access for voice-messages" ON storage.objects;

-- 3. 새 정책 생성
CREATE POLICY "Public read access for voice-messages"
ON storage.objects
FOR SELECT
USING (bucket_id = 'voice-messages');

CREATE POLICY "Public upload access for voice-messages"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'voice-messages');
```

**또는 `lib/supabase/storage_policies.sql` 파일 전체를 복사하여 실행**

### 3. 버킷이 존재하는지 확인

Supabase SQL Editor에서 실행:

```sql
SELECT * FROM storage.buckets WHERE id = 'voice-messages';
```

**결과가 없으면:**
1. Supabase Dashboard → **Storage**
2. **New bucket** 클릭
3. 이름: `voice-messages` (정확히!)
4. **Public bucket** ✅ 체크
5. **Create bucket** 클릭

### 4. 환경 변수 확인

`.env.local` 파일에 다음이 설정되어 있는지 확인:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

**확인 방법:**
1. Supabase Dashboard → **Settings** → **API**
2. Project URL과 anon public key 복사
3. `.env.local`에 붙여넣기

## 🔧 단계별 해결 방법

### Step 1: Storage 버킷 재생성 (가장 확실한 방법)

1. Supabase Dashboard → **Storage**
2. `voice-messages` 버킷 선택
3. **Delete bucket** 클릭 (기존 파일이 있다면 백업)
4. **New bucket** 클릭
5. 이름: `voice-messages`
6. **Public bucket** ✅ 체크
7. **Create bucket** 클릭

### Step 2: RLS 정책 설정

1. Supabase Dashboard → **SQL Editor**
2. **New Query** 클릭
3. `lib/supabase/storage_policies.sql` 파일 내용 복사
4. 붙여넣기 후 **Run** 클릭

### Step 3: 테스트 업로드

브라우저 콘솔에서 실행:

```javascript
// Supabase 클라이언트 가져오기
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// 테스트 파일 생성
const testBlob = new Blob(['test'], { type: 'audio/webm' });
const testFile = new File([testBlob], 'test.webm', { type: 'audio/webm' });

// 업로드 테스트
supabase.storage
  .from('voice-messages')
  .upload('test.webm', testFile, {
    contentType: 'audio/webm',
    upsert: false,
  })
  .then(({ data, error }) => {
    if (error) {
      console.error('Upload error:', error);
    } else {
      console.log('Upload success:', data);
    }
  });
```

### Step 4: 네트워크 요청 확인

브라우저 개발자 도구 → **Network** 탭:

1. 음성 업로드 시도
2. 실패한 요청 찾기
3. **Headers** 탭 확인:
   - `Authorization: Bearer ...` 헤더가 있는지
   - `Content-Type: audio/webm` 헤더가 있는지
4. **Response** 탭 확인:
   - 에러 메시지 확인
   - 상태 코드 확인 (403, 404, 500 등)

## 🚨 일반적인 에러와 해결책

### 에러 1: "new row violates row-level security policy"

**원인:** Storage RLS 정책이 없거나 잘못 설정됨

**해결:**
1. `lib/supabase/storage_policies.sql` 실행
2. 또는 Supabase Dashboard → **Storage** → **Policies**에서 수동 설정

### 에러 2: "Bucket not found"

**원인:** `voice-messages` 버킷이 존재하지 않음

**해결:**
1. Supabase Dashboard → **Storage**
2. 버킷 목록 확인
3. 없으면 생성 (Public으로!)

### 에러 3: "Permission denied" 또는 403 에러

**원인:**
- 버킷이 Public이 아님
- RLS 정책이 없음
- anon key가 잘못됨

**해결:**
1. 버킷이 Public인지 확인
2. RLS 정책 설정
3. 환경 변수 확인

### 에러 4: "File size exceeds limit"

**원인:** 파일 크기 제한 초과

**해결:**
1. Supabase Dashboard → **Storage** → **Settings**
2. **File size limit** 증가 (최소 10MB, 권장 50MB)

### 에러 5: "Duplicate" 또는 409 에러

**원인:** 같은 파일명으로 업로드 시도

**해결:**
- 코드에서 이미 처리됨 (타임스탬프 사용)
- 문제가 계속되면 Supabase Storage에서 기존 파일 삭제

## 📋 체크리스트

업로드 문제 해결을 위한 체크리스트:

- [ ] `voice-messages` 버킷이 존재함
- [ ] 버킷이 **Public**으로 설정됨
- [ ] Storage RLS 정책이 설정됨
- [ ] 환경 변수가 올바르게 설정됨
- [ ] 파일 크기 제한이 충분함 (10MB+)
- [ ] 브라우저 콘솔에 에러가 없음
- [ ] 네트워크 요청이 성공함 (200 또는 201)

## 🔍 디버깅 팁

### 1. 브라우저 콘솔 확인

개발자 도구 → **Console** 탭:
- 빨간색 에러 메시지 확인
- `console.log` 출력 확인
- 에러 스택 트레이스 확인

### 2. 네트워크 탭 확인

개발자 도구 → **Network** 탭:
- 실패한 요청 찾기 (빨간색)
- 요청 URL 확인
- 요청 헤더 확인
- 응답 본문 확인

### 3. Supabase 로그 확인

Supabase Dashboard → **Logs** → **API Logs**:
- 최근 요청 확인
- 에러 로그 확인
- 상태 코드 확인

## 🔧 기존 데이터 수정 (중요!)

### 기존 voice_url 경로 수정

기존에 업로드된 파일들의 URL에 `voice-messages/voice-messages/`가 중복되어 있을 수 있습니다.

**Supabase SQL Editor에서 실행:**

```sql
-- 중복 경로 수정
UPDATE voice_messages
SET voice_url = REPLACE(voice_url, '/voice-messages/voice-messages/', '/voice-messages/')
WHERE voice_url LIKE '%/voice-messages/voice-messages/%';
```

**또는 `lib/supabase/fix_voice_urls.sql` 파일 전체를 복사하여 실행**

### 확인

수정 후 확인:

```sql
-- 중복 경로가 남아있는지 확인
SELECT id, voice_url 
FROM voice_messages 
WHERE voice_url LIKE '%/voice-messages/voice-messages/%';
```

결과가 없으면 수정 완료!

## 📞 추가 도움

문제가 계속되면:

1. 브라우저 콘솔의 전체 에러 메시지 복사
2. 네트워크 탭의 실패한 요청 스크린샷
3. Supabase Dashboard의 Storage 설정 스크린샷

이 정보들을 함께 제공하면 더 정확한 해결책을 제시할 수 있습니다.
