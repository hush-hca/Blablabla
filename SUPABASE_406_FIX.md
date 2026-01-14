# Supabase 406 "Not Acceptable" 오류 해결 가이드

## 🔧 수정된 내용

Supabase 클라이언트 설정에 필요한 HTTP 헤더를 명시적으로 추가했습니다:

```typescript
global: {
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'apikey': supabaseAnonKey,
  },
},
```

## 📋 추가로 확인해야 할 사항

### 1. Supabase RLS (Row Level Security) 정책 확인

406 오류가 계속 발생한다면, Supabase의 Row Level Security 정책 문제일 수 있습니다.

**확인 방법:**

1. Supabase Dashboard 접속
2. **Authentication** → **Policies** 메뉴로 이동
3. `daily_claims` 테이블의 정책 확인

**필요한 정책:**

```sql
-- daily_claims 테이블에 대한 읽기 정책
CREATE POLICY "Allow public read access to daily_claims"
ON daily_claims
FOR SELECT
USING (true);

-- daily_claims 테이블에 대한 삽입 정책
CREATE POLICY "Allow public insert to daily_claims"
ON daily_claims
FOR INSERT
WITH CHECK (true);
```

**또는 RLS를 비활성화 (개발 환경에서만):**

```sql
ALTER TABLE daily_claims DISABLE ROW LEVEL SECURITY;
```

⚠️ **주의**: 프로덕션에서는 RLS를 활성화하고 적절한 정책을 설정하세요.

### 2. 테이블 존재 확인

Supabase SQL Editor에서 다음 쿼리 실행:

```sql
SELECT * FROM daily_claims LIMIT 1;
```

테이블이 존재하지 않는다면 `lib/supabase/schema.sql`을 실행하세요.

### 3. 환경 변수 확인

`.env.local` 파일에 다음 변수가 올바르게 설정되어 있는지 확인:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

**확인 방법:**

1. Supabase Dashboard → **Settings** → **API**
2. Project URL과 anon public key 복사
3. `.env.local` 파일에 붙여넣기

### 4. Supabase 프로젝트 상태 확인

- Supabase 프로젝트가 활성화되어 있는지 확인
- 프로젝트가 일시 중지되지 않았는지 확인
- API 요청 한도가 초과되지 않았는지 확인

### 5. 네트워크 요청 헤더 확인

브라우저 개발자 도구에서:

1. **Network** 탭 열기
2. 실패한 `daily_claims` 요청 클릭
3. **Headers** 탭 확인:
   - `Accept: application/json` 헤더가 있는지 확인
   - `apikey` 헤더가 있는지 확인
   - `Authorization: Bearer ...` 헤더가 있는지 확인

## 🔍 문제 해결 단계

### Step 1: 브라우저 캐시 삭제

1. 개발 서버 재시작:
   ```bash
   npm run dev
   ```

2. 브라우저 하드 리프레시:
   - Chrome/Edge: `Ctrl+Shift+R` (Windows) 또는 `Cmd+Shift+R` (Mac)
   - Firefox: `Ctrl+F5` (Windows) 또는 `Cmd+Shift+R` (Mac)

### Step 2: Supabase 정책 확인

Supabase Dashboard에서 `daily_claims` 테이블의 RLS 정책을 확인하고, 필요시 위의 SQL을 실행하세요.

### Step 3: 직접 API 테스트

Supabase REST API를 직접 테스트:

```bash
curl -X GET \
  'https://your-project.supabase.co/rest/v1/daily_claims?select=*' \
  -H 'apikey: your-anon-key' \
  -H 'Authorization: Bearer your-anon-key' \
  -H 'Accept: application/json'
```

성공하면 테이블과 정책은 정상입니다. 실패하면 Supabase 설정 문제입니다.

### Step 4: 로그 확인

브라우저 콘솔에서 더 자세한 오류 메시지 확인:

```javascript
// 개발자 도구 콘솔에서 실행
const { data, error } = await supabase
  .from('daily_claims')
  .select('*')
  .limit(1);

console.log('Data:', data);
console.log('Error:', error);
```

## 🚨 여전히 오류가 발생하는 경우

### 대안 1: Supabase 클라이언트 재설정

`lib/supabase/client.ts` 파일을 확인하고, 필요시 Supabase 클라이언트를 재생성하세요.

### 대안 2: 서버 사이드에서 처리

클라이언트 사이드 대신 API Route를 통해 처리:

```typescript
// app/api/claims/route.ts
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  
  const { data, error } = await supabase
    .from('daily_claims')
    .select('*');
    
  return Response.json({ data, error });
}
```

### 대안 3: Supabase 지원팀 문의

위의 모든 방법을 시도했지만 여전히 문제가 있다면:
- Supabase Dashboard의 **Support** 메뉴에서 문의
- 오류 메시지와 함께 네트워크 요청 헤더 스크린샷 첨부

## ✅ 체크리스트

- [ ] Supabase 클라이언트 헤더 설정 확인
- [ ] 환경 변수 설정 확인
- [ ] RLS 정책 확인 및 설정
- [ ] 테이블 존재 확인
- [ ] 브라우저 캐시 삭제 및 재시작
- [ ] 네트워크 요청 헤더 확인
- [ ] 직접 API 테스트

## 📚 참고 자료

- [Supabase RLS 가이드](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase REST API 문서](https://supabase.com/docs/reference/javascript/select)
- [Supabase 클라이언트 설정](https://supabase.com/docs/reference/javascript/initializing)
