# 🚀 빠른 시작 가이드 (5분)

## 준비물
- Supabase 계정 (supabase.com - 무료)
- Node.js 18+
- Git (GitHub 배포용)

---

## 1단계: Supabase 설정 (2분)

### 1.1 프로젝트 생성
```
supabase.com → New Project
이름: debt-tracker
```

### 1.2 API 키 복사
```
프로젝트 설정 → API
이 3가지 복사:
- Project URL
- anon key
- service_role key
```

### 1.3 SQL 실행
```
SQL Editor → New Query
SETUP.md의 "2️⃣ Supabase 데이터베이스 스키마 생성" 섹션의 SQL을 모두 복사하여 실행
```

---

## 2단계: 로컬 실행 (2분)

### 2.1 환경 변수 설정
```bash
# .env.local 파일 생성
cp .env.local.example .env.local

# 다음을 입력:
NEXT_PUBLIC_SUPABASE_URL=복사한_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=복사한_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=복사한_SERVICE_KEY
NEXT_PUBLIC_APP_PASSWORD=1225
```

### 2.2 실행
```bash
npm install
npm run dev
```

### 2.3 브라우저에서 열기
```
http://localhost:3000
비밀번호: 1225 입력
```

---

## 3단계: Vercel 배포 (1분)

### 3.1 GitHub 푸시
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/debt-tracker
git push -u origin main
```

### 3.2 Vercel 배포
1. vercel.com → GitHub 로그인
2. "Import Project" → `debt-tracker` 저장소 선택
3. 환경 변수 추가:
   ```
   NEXT_PUBLIC_SUPABASE_URL=URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY=KEY
   SUPABASE_SERVICE_ROLE_KEY=KEY
   NEXT_PUBLIC_APP_PASSWORD=1225
   ```
4. "Deploy" 클릭

---

## ✅ 완료!

이제 다음을 할 수 있습니다:
- ✅ 대출 추가/수정/삭제
- ✅ 상환 기록 추가
- ✅ 실시간 데이터 동기화
- ✅ 어디서든 웹으로 접속 가능

---

## 🐛 문제해결

| 문제 | 해결책 |
|------|--------|
| 로그인 실패 | .env.local 파일 확인, 비밀번호 1225 맞는지 확인 |
| 데이터 안 보임 | Supabase RLS 정책 확인, 네트워크 탭 확인 |
| 차트 안 보임 | 데이터 추가 후 새로고침 (F5) |
| 배포 실패 | Vercel 환경 변수 모두 입력했는지 확인 |

---

## 📞 추가 도움말
- 자세한 설정: `SETUP.md` 참고
- Supabase 도움: https://supabase.com/docs
- Vercel 도움: https://vercel.com/docs
