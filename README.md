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
│   │   ├── CommentItem.tsx # 재귀 댓글 렌더링
│   │   └── CommentList.tsx # 무한 스크롤 댓글 리스트
│   ├── rating/
│   │   └── StarRating.tsx  # 1~10점 별점 입력
│   ├── viewer/
│   │   ├── SecureViewer.tsx    # 보안 뷰어 (복사/우클릭 차단)
│   │   └── ViewerSettings.tsx  # 가독성 설정 (폰트, 테마)
│   ├── writer/
│   │   └── ExportChapterForm.tsx # 챕터 내보내기 폼
│   └── ui/                 # shadcn/ui 컴포넌트
│
├── hooks/                  # 커스텀 훅
│   ├── useDiscovery.ts     # 작품 탐색/검색
│   ├── useRating.ts        # 별점 (낙관적 업데이트)
│   ├── useComments.ts      # 댓글 (무한 스크롤)
│   ├── useLibrary.ts       # 내 서재
│   ├── useBookmark.ts      # 북마크
│   ├── useSecureContent.ts # 콘텐츠 보안
│   └── useExportChapter.ts # 챕터 내보내기
│
├── pages/                  # 페이지 컴포넌트
│   ├── HomePage.tsx        # 공개 홈 (작품 그리드)
│   ├── WorkDetailPage.tsx  # 작품 상세
│   ├── ChapterViewerPage.tsx # 챕터 뷰어
│   └── LibraryPage.tsx     # 내 서재
│
├── stores/                 # Zustand 스토어
│   └── useAuthStore.ts     # 인증 상태
│
├── types/                  # TypeScript 타입
│   └── index.ts            # ERD 기반 타입 정의
│
└── App.tsx                 # 라우터 설정
```

## ✨ 주요 기능

### 독자 서비스

| 기능 | 설명 |
|------|------|
| **작품 탐색** | 장르별 필터, 검색 |
| **작품 상세** | 표지, 줄거리, 챕터 리스트 |
| **보안 뷰어** | 복사/우클릭/드래그 차단 |
| **가독성 설정** | 폰트 크기, 테마(라이트/다크/세피아), 줄 간격 |
| **별점** | 1~10점 입력 (낙관적 업데이트) |
| **댓글** | 계층형 대댓글, 무한 스크롤, 좋아요 |
| **내 서재** | 관심 작품 담기 |

### 작가 서비스

| 기능 | 설명 |
|------|------|
| **챕터 내보내기** | 에디터 원고를 챕터로 배포 |
| **작품 생성** | 표지, 장르, 줄거리 설정 |

## 📝 코드 컨벤션

### 파일 네이밍

- 컴포넌트: `PascalCase.tsx`
- 훅: `useCamelCase.ts`
- 타입: `index.ts`

### 커밋 메시지

```
feat: 새로운 기능
fix: 버그 수정
chore: 설정, 의존성 등
docs: 문서
refactor: 리팩토링
```

## 🔗 API 엔드포인트

백엔드 API 명세는 [API 문서](./docs/api.md) 참고 (예정)

| 영역 | 엔드포인트 |
|------|-----------|
| 탐색 | `GET /api/discovery` |
| 검색 | `GET /api/discovery/search` |
| 작품 상세 | `GET /api/discovery/works/:id` |
| 챕터 열람 | `GET /api/discovery/chapters/:id` |
| 별점 | `POST /api/chapters/:id/rating` |
| 댓글 | `GET /api/chapters/:id/comments` |
| 서재 | `GET/POST/DELETE /api/library` |

## 👥 팀원

- Frontend 개발

## 📄 라이선스

Private
