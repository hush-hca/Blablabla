# Supabase 완전 설정 가이드

## 🚨 중요: SQL 스크립트 중복 실행 문제 해결

여러 개의 SQL 스크립트를 개별적으로 실행하면 정책 중복 에러가 발생할 수 있습니다.

**해결책: 통합 스크립트 사용**

## ✅ 권장 방법: 통합 스크립트 사용

### 1. 통합 스크립트 실행 (권장)

**한 번만 실행하면 모든 설정이 완료됩니다:**

1. Supabase Dashboard → **SQL Editor**
2. **New Query** 클릭
3. `lib/supabase/setup_complete.sql` 파일 내용 **전체** 복사
4. 붙여넣기 후 **Run** 클릭

이 스크립트는:
- ✅ 모든 테이블 생성 (IF NOT EXISTS 사용)
- ✅ 모든 인덱스 생성 (IF NOT EXISTS 사용)
- ✅ 기존 정책 삭제 후 재생성 (중복 방지)
- ✅ 기존 데이터 수정 (voice_url 경로, user_id 백필)
- ✅ **안전하게 여러 번 실행 가능** (idempotent)

### 2. 개별 스크립트 사용 (비권장)

개별 스크립트를 사용하는 경우, 다음 순서로 실행하세요:

#### 순서 1: 스키마 생성
```sql
-- lib/supabase/schema.sql 실행
```

#### 순서 2: 기존 정책 삭제 (중복 방지)
```sql
-- 모든 정책 삭제
DROP POLICY IF EXISTS "..." ON users;
DROP POLICY IF EXISTS "..." ON voice_messages;
-- ... (모든 정책)
```

#### 순서 3: RLS 정책 생성
```sql
-- lib/supabase/rls_policies.sql 실행
```

#### 순서 4: Storage 정책 생성
```sql
-- lib/supabase/storage_policies.sql 실행
```

#### 순서 5: 데이터 수정
```sql
-- lib/supabase/fix_voice_urls.sql 실행
-- lib/supabase/migration_claim_user_id.sql 실행
```

## 🔍 현재 정책 확인

Supabase SQL Editor에서 실행:

```sql
-- 테이블 정책 확인
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Storage 정책 확인
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'objects'
ORDER BY policyname;
```

## 🚨 일반적인 에러와 해결책

### 에러 1: "policy already exists"

**원인:** 같은 이름의 정책이 이미 존재

**해결:**
```sql
-- 기존 정책 삭제 후 재생성
DROP POLICY IF EXISTS "정책이름" ON 테이블이름;
CREATE POLICY "정책이름" ON 테이블이름 ...;
```

또는 통합 스크립트 사용 (자동으로 처리됨)

### 에러 2: "relation already exists"

**원인:** 테이블이 이미 존재

**해결:** 
- `CREATE TABLE IF NOT EXISTS` 사용 (이미 적용됨)
- 또는 기존 테이블 삭제 후 재생성 (주의: 데이터 손실)

### 에러 3: "duplicate key value violates unique constraint"

**원인:** UNIQUE 제약 조건 위반

**해결:**
- 데이터 확인 후 중복 제거
- 또는 제약 조건 수정

## 📋 체크리스트

설정 완료 확인:

- [ ] `setup_complete.sql` 실행 완료
- [ ] 모든 테이블 생성 확인
- [ ] 모든 정책 생성 확인
- [ ] Storage 버킷 `voice-messages` 생성 (Public)
- [ ] 환경 변수 설정 확인
- [ ] 기존 데이터 수정 완료 (voice_url, user_id)

## 🔧 문제 해결

### 모든 정책 초기화 (주의: 데이터 손실 없음)

```sql
-- 모든 테이블 정책 삭제
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
    EXECUTE 'DROP POLICY IF EXISTS "Allow public read access to ' || r.tablename || '" ON ' || r.tablename || ';';
    EXECUTE 'DROP POLICY IF EXISTS "Allow public insert to ' || r.tablename || '" ON ' || r.tablename || ';';
    -- 필요한 정책들 모두 삭제
  END LOOP;
END $$;

-- Storage 정책 삭제
DROP POLICY IF EXISTS "Public read access for voice-messages" ON storage.objects;
DROP POLICY IF EXISTS "Public upload access for voice-messages" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own files in voice-messages" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own files in voice-messages" ON storage.objects;
```

그 후 `setup_complete.sql` 다시 실행

## 📝 참고

- **통합 스크립트 사용 권장**: 중복 실행 안전, 모든 설정 한 번에
- **개별 스크립트**: 특정 부분만 수정할 때 사용
- **정책 확인**: `pg_policies` 뷰로 현재 상태 확인
