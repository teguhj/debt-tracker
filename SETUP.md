# 자유로의 여정 - Supabase + Vercel 설정 가이드

## 1️⃣ Supabase 프로젝트 생성

### Step 1: Supabase 가입
1. [Supabase](https://supabase.com)에 접속하여 가입
2. Google 또는 GitHub으로 로그인

### Step 2: 새 프로젝트 생성
1. 대시보드에서 "New Project" 클릭
2. 프로젝트 이름: `debt-tracker` (원하는 이름으로 설정 가능)
3. 강력한 비밀번호 설정
4. 지역 선택: Asia (Singapore) 또는 가장 가까운 지역
5. "Create new project" 클릭 (프로젝트 생성에 2-3분 소요)

### Step 3: API 키 복사
1. 프로젝트 설정 → API 섹션
2. 다음 정보 복사:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon key` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role key` → `SUPABASE_SERVICE_ROLE_KEY`

---

## 2️⃣ Supabase 데이터베이스 스키마 생성

### Step 1: SQL Editor 열기
1. Supabase 대시보드 → SQL Editor
2. "New Query" 클릭

### Step 2: 다음 SQL 쿼리 실행

```sql
-- 사용자 (기본적으로 Supabase Auth 사용)

-- 대출 테이블
create table debts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  principal numeric not null,
  balance numeric not null,
  interest_rate numeric,
  payment_date integer not null,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- 상환 기록 테이블
create table payments (
  id uuid default gen_random_uuid() primary key,
  debt_id uuid references debts(id) on delete cascade not null,
  amount numeric not null,
  date text not null,
  created_at timestamp default now()
);

-- Row Level Security (RLS) 정책
alter table debts enable row level security;
alter table payments enable row level security;

-- Debts RLS 정책
create policy "Users can view their own debts"
on debts for select
using (auth.uid() = user_id);

create policy "Users can create debts"
on debts for insert
with check (auth.uid() = user_id);

create policy "Users can update their own debts"
on debts for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete their own debts"
on debts for delete
using (auth.uid() = user_id);

-- Payments RLS 정책
create policy "Users can view payments for their debts"
on payments for select
using (
  exists (
    select 1 from debts
    where debts.id = payments.debt_id
    and debts.user_id = auth.uid()
  )
);

create policy "Users can create payments for their debts"
on payments for insert
with check (
  exists (
    select 1 from debts
    where debts.id = payments.debt_id
    and debts.user_id = auth.uid()
  )
);

create policy "Users can delete payments for their debts"
on payments for delete
using (
  exists (
    select 1 from debts
    where debts.id = payments.debt_id
    and debts.user_id = auth.uid()
  )
);
```

### Step 3: 인덱스 생성 (성능 최적화)

```sql
create index debts_user_id_idx on debts(user_id);
create index payments_debt_id_idx on payments(debt_id);
```

---

## 3️⃣ 로컬 개발 환경 설정

### Step 1: 환경 변수 설정
1. 프로젝트 루트에 `.env.local` 파일 생성
2. `.env.local.example` 파일의 내용을 복사하여 붙여넣기
3. Supabase에서 복사한 API 키 입력:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_APP_PASSWORD=1225
```

### Step 2: 프로젝트 실행
```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3000` 접속

---

## 4️⃣ Vercel 배포

### Step 1: GitHub 저장소 생성
```bash
git init
git add .
git commit -m "Initial commit: Debt tracker app with Supabase"
git branch -M main
git remote add origin https://github.com/yourusername/debt-tracker.git
git push -u origin main
```

### Step 2: Vercel 배포
1. [Vercel](https://vercel.com)에 접속하여 GitHub으로 로그인
2. "Import Project" 클릭
3. GitHub 저장소 선택 (`debt-tracker`)
4. 프로젝트 설정:
   - Framework: `Next.js`
   - Root Directory: `./`

5. Environment Variables 추가:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   NEXT_PUBLIC_APP_PASSWORD=1225
   ```

6. "Deploy" 클릭

### Step 3: 배포 확인
- Vercel이 제공하는 URL에서 앱 접속
- 배포 완료 후 자동으로 도메인 할당됨

---

## 5️⃣ 기능 설명

### 인증
- 간단한 비밀번호 인증 (기본값: `1225`)
- Supabase 익명 인증 사용으로 사용자별 데이터 격리

### 대출 관리 (CRUD)
- **Create**: 새 대출 항목 추가
- **Read**: 모든 대출 정보 조회
- **Update**: 상환 금액으로 자동 업데이트
- **Delete**: 대출 항목 삭제

### 상환 기록 (CRUD)
- **Create**: 상환 기록 추가
- **Read**: 모든 상환 기록 조회
- **Delete**: 상환 기록 삭제 (자동 잔액 복원)

### 데이터 시각화
- 전체 상환률 (도넛 차트)
- 대출별 비교 (막대 그래프)
- 상환 추이 (라인 차트)

### 동기부여
- 매일 변하는 응원 메시지
- 다음 납입일 계산
- 월별 상환액 합계

---

## 6️⃣ 커스터마이징

### 비밀번호 변경
`.env.local`에서:
```bash
NEXT_PUBLIC_APP_PASSWORD=your_password
```

### 응원 메시지 추가
`src/components/MotivationCard.tsx`의 `quotes` 배열 수정

### 스타일 변경
`src/app/globals.css`에서 색상 및 애니메이션 커스터마이징

---

## 7️⃣ 트러블슈팅

### 로그인 실패
- `.env.local`의 비밀번호 확인
- Supabase 프로젝트가 실행 중인지 확인

### 데이터가 저장되지 않음
- Supabase RLS 정책 확인
- 네트워크 탭에서 API 응답 확인

### 차트가 표시되지 않음
- 데이터가 추가되었는지 확인
- 브라우저 콘솔에서 에러 메시지 확인

---

## 📊 데이터베이스 구조

```
users (Supabase Auth)
├── debts
│   ├── id (UUID)
│   ├── user_id (FK)
│   ├── name (TEXT)
│   ├── principal (NUMERIC)
│   ├── balance (NUMERIC)
│   ├── interest_rate (NUMERIC)
│   ├── payment_date (INTEGER)
│   └── timestamps
│
└── payments
    ├── id (UUID)
    ├── debt_id (FK)
    ├── amount (NUMERIC)
    ├── date (TEXT)
    └── created_at
```

---

## 🚀 배포 후 다음 단계

1. **도메인 연결**: Vercel 설정에서 커스텀 도메인 추가
2. **CORS 설정**: Supabase에서 필요시 CORS 정책 수정
3. **백업**: Supabase 자동 백업 활성화
4. **모니터링**: Vercel Analytics로 성능 모니터링

---

## 📧 지원 및 피드백

- Supabase 문서: https://supabase.com/docs
- Vercel 문서: https://vercel.com/docs
- Next.js 문서: https://nextjs.org/docs
