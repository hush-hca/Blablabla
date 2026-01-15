# Supabase Claim 기능 수정 가이드

## 🔍 확인해야 할 사항

최근 claim 페이지에서 `user_id`를 포함하도록 수정했습니다. Supabase에서 다음을 확인하고 필요시 수정해야 합니다.

## 📋 체크리스트

### 1. ✅ `daily_claims` 테이블에 `user_id` 컬럼이 있는지 확인

Supabase SQL Editor에서 실행:

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'daily_claims'
ORDER BY ordinal_position;
```

**예상 결과:**
- `id` (uuid)
- `user_id` (uuid, nullable)
- `wallet_address` (text)
- `claim_date` (date)
- ...

### 2. ✅ 기존 레코드에 `user_id` 업데이트 (필요한 경우)

만약 `daily_claims` 테이블에 `user_id`가 NULL인 레코드가 있다면:

1. Supabase SQL Editor 열기
2. `lib/supabase/migration_claim_user_id.sql` 파일 내용 복사
3. SQL Editor에 붙여넣기
4. **Run** 버튼 클릭

이 스크립트는:
- `users` 테이블에 없는 wallet_address에 대해 사용자 생성
- `daily_claims`의 NULL `user_id`를 올바른 `user_id`로 업데이트

### 3. ✅ RLS (Row Level Security) 정책 확인

Supabase Dashboard에서:

1. **Authentication** → **Policies** 메뉴로 이동
2. `daily_claims` 테이블 선택
3. 다음 정책이 있는지 확인:
   - **SELECT**: Public read access
   - **INSERT**: Public insert access

**정책이 없다면:**

1. Supabase SQL Editor 열기
2. `lib/supabase/rls_policies.sql` 파일 내용 복사
3. SQL Editor에 붙여넣기
4. **Run** 버튼 클릭

또는 Dashboard에서 직접 정책 생성:

```sql
-- 읽기 정책
CREATE POLICY "Allow public read access to daily_claims"
ON daily_claims
FOR SELECT
USING (true);

-- 삽입 정책
CREATE POLICY "Allow public insert to daily_claims"
ON daily_claims
FOR INSERT
WITH CHECK (true);
```

### 4. ✅ `users` 테이블 RLS 정책 확인

`users` 테이블에도 다음 정책이 필요합니다:

```sql
-- 읽기 정책
CREATE POLICY "Allow public read access to users"
ON users
FOR SELECT
USING (true);

-- 삽입 정책 (지갑 주소로 사용자 생성)
CREATE POLICY "Allow public insert to users"
ON users
FOR INSERT
WITH CHECK (true);
```

## 🚨 문제 해결

### 문제 1: "null value in column 'user_id' violates not-null constraint"

**원인:** `daily_claims` 테이블의 `user_id`가 NOT NULL로 설정되어 있지만, 코드에서 NULL을 삽입하려고 함

**해결:**
1. `migration_claim_user_id.sql` 실행 (기존 레코드 업데이트)
2. 또는 `user_id`를 nullable로 변경:
   ```sql
   ALTER TABLE daily_claims 
   ALTER COLUMN user_id DROP NOT NULL;
   ```

### 문제 2: "permission denied for table daily_claims"

**원인:** RLS 정책이 없거나 잘못 설정됨

**해결:**
1. `rls_policies.sql` 실행
2. 또는 RLS를 임시로 비활성화 (개발 환경에서만):
   ```sql
   ALTER TABLE daily_claims DISABLE ROW LEVEL SECURITY;
   ```

### 문제 3: "foreign key constraint violation"

**원인:** `daily_claims.user_id`가 `users.id`를 참조하지만, 해당 사용자가 존재하지 않음

**해결:**
1. `migration_claim_user_id.sql` 실행
2. 또는 외래 키 제약 조건을 확인:
   ```sql
   SELECT 
     tc.constraint_name, 
     tc.table_name, 
     kcu.column_name,
     ccu.table_name AS foreign_table_name,
     ccu.column_name AS foreign_column_name
   FROM information_schema.table_constraints AS tc
   JOIN information_schema.key_column_usage AS kcu
     ON tc.constraint_name = kcu.constraint_name
   JOIN information_schema.constraint_column_usage AS ccu
     ON ccu.constraint_name = tc.constraint_name
   WHERE tc.table_name = 'daily_claims'
     AND tc.constraint_type = 'FOREIGN KEY';
   ```

## ✅ 테스트 방법

Supabase SQL Editor에서 다음 쿼리로 테스트:

```sql
-- 1. 테이블 구조 확인
SELECT * FROM daily_claims LIMIT 1;

-- 2. user_id가 NULL인 레코드 확인
SELECT COUNT(*) FROM daily_claims WHERE user_id IS NULL;

-- 3. users 테이블 확인
SELECT * FROM users LIMIT 5;

-- 4. RLS 정책 확인
SELECT * FROM pg_policies WHERE tablename = 'daily_claims';
```

## 📝 참고

- 모든 마이그레이션은 **Supabase SQL Editor**에서 실행하세요
- 프로덕션 환경에서는 마이그레이션 전에 **백업**을 권장합니다
- RLS 정책은 보안에 중요하므로 신중하게 설정하세요
