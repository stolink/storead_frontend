# 📚 StoRead Frontend

AI 스마트 스토리 플랫폼 - 독자 서비스 및 작가 배포 시스템

## 🛠 기술 스택

| 영역 | 기술 |
|------|------|
| **Core** | React 18, TypeScript, Vite |
| **Styling** | Tailwind CSS v4, shadcn/ui |
| **Server State** | TanStack Query v5 |
| **Client State** | Zustand |
| **Forms** | React Hook Form, Zod |
| **Routing** | React Router DOM |

## 🚀 시작하기

### 의존성 설치

```bash
npm install
```

### 개발 서버 실행

```bash
npm run dev
```

→ http://localhost:5173 접속

### 프로덕션 빌드

```bash
npm run build
```

## 🌐 환경 변수

`.env` 파일 생성:

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

## 📁 프로젝트 구조

```
src/
├── api/                    # API 클라이언트
│   └── client.ts           # Axios 인스턴스 + 인증 인터셉터
│
├── components/             # 재사용 컴포넌트
│   ├── comments/           # 댓글 관련
│   ├── layout/             # 레이아웃 (Header, ProtectedRoute)
│   ├── rating/             # 별점 컴포넌트
│   ├── viewer/             # 보안 뷰어 및 설정
│   ├── writer/             # 작가 전용 컴포넌트
│   └── ui/                 # shadcn/ui 컴포넌트
│
├── hooks/                  # 커스텀 훅
│   ├── useAuth.ts          # 인증 (로그인/회원가입/로그아웃)
│   ├── useDiscovery.ts     # 작품 탐색/검색
│   ├── useLibrary.ts       # 내 서재
│   ├── useWorks.ts         # 작가 작품 관리
│   ├── useChapters.ts      # 작가 챕터 관리
│   └── useExportChapter.ts # 챕터 내보내기/연동
│
├── pages/                  # 페이지 컴포넌트
│   ├── Auth/               # 인증 (로그인, 회원가입)
│   ├── Author/             # 작가 대시보드 및 관리
│   │   ├── AuthorDashboardPage.tsx
│   │   ├── WorkEditPage.tsx
│   │   └── ChapterManagePage.tsx
│   ├── Profile/            # 프로필 관리
│   ├── HomePage.tsx        # 공개 홈
│   ├── WorkDetailPage.tsx  # 작품 상세
│   └── LibraryPage.tsx     # 내 서재
│
├── stores/                 # Zustand 스토어
│   └── useAuthStore.ts     # 인증 상태 관리
│
└── App.tsx                 # 라우터 및 보호된 경로 설정
```

## ✨ 주요 기능

### 독자 서비스

| 기능 | 설명 |
|------|------|
| **작품 탐색** | 장르별 필터, 검색 |
| **작품 상세** | 표지, 줄거리, 챕터 리스트 |
| **보안 뷰어** | 복사/우클릭/드래그 차단 |
| **가독성 설정** | 폰트 크기, 테마, 줄 간격 |
| **소셜 기능** | 별점, 계층형 댓글, 좋아요 |
| **내 서재** | 관심 작품 담기 및 정렬 |

### 작가 서비스

| 기능 | 설명 |
|------|------|
| **대시보드** | 내 작품 목록 조회 및 관리, 통합 뷰 |
| **작품 관리** | 새 작품 생성, 정보(표지/줄거리) 수정, 삭제 |
| **챕터 관리** | 챕터 목록 조회, 새 챕터 작성, 수정, 삭제, 순서 관리 |
| **프로필 관리** | 작가 프로필 정보 수정 |

## 🔗 API 엔드포인트

| 영역 | 엔드포인트 | Method |
|------|-----------|:------:|
| **인증** | `/api/auth/login` | POST |
| | `/api/auth/register` | POST |
| **탐색** | `/api/discovery` | GET |
| **작품** | `/api/works` | GET/POST |
| | `/api/works/:id` | PUT/DELETE |
| **챕터** | `/api/works/:workId/chapters` | GET/POST |
| | `/api/chapters/:id` | PUT/DELETE |
| **서재** | `/api/library` | GET/POST |

## 📝 코드 컨벤션

### 파일 네이밍
- 컴포넌트: `PascalCase.tsx`
- 훅: `useCamelCase.ts`

### 커밋 메시지
- `feat`: 새로운 기능
- `fix`: 버그 수정
- `docs`: 문서
- `refactor`: 리팩토링

## 📄 라이선스

Private
