# CLAUDE.md - Storead Project Constitution

> AI 모델이 세션 시작 시 **반드시** 읽어야 하는 핵심 헌법입니다.

**버전**: 1.0
**최종 수정**: 2026년 1월 8일
**문서 상태**: 활성

---

## 프로젝트 개요

**Storead** - AI 스마트 스토리 독자 플랫폼
웹소설 열람, 댓글/별점, 내 서재, 캐릭터 관계도 뷰어, 결제 시스템을 지원하는 독자용 서비스

**기술 스택**: React 19.0, TypeScript 5.7, Zustand 5.0, TanStack Query 5.90, Tailwind CSS 4.1
**백엔드**: Spring Boot (storead_spring), PostgreSQL
**결제**: TossPayments SDK

---

## 절대적 제약 사항 (MUST NOT)

🔴 **다음 규칙은 절대 위반 금지**:

- `any`, `as any` 타입 사용
- 인라인 스타일 (Tailwind 사용)
- console.log 커밋 (개발용 제외)
- Set, Map을 Zustand에 저장
- 중복 로직 작성 (기존 hooks/services 확인 필수)
- main/dev 브랜치에 직접 push (PR 필수)
- useEffect 의존성 배열 회피 (린트 에러 무시)
- useQuery 내부에서 Zustand 직접 업데이트
- 결제 로직에서 금액 프론트엔드 조작 (서버 검증 필수)
- 콘텐츠 보호 우회 로직 작성 (useSecureContent 준수)

---

## 핵심 아키텍처 원칙 (MUST)

### TypeScript

- Strict Mode 준수
- 명시적 타입 정의 (export 함수/컴포넌트 필수)
- 유틸리티 타입 활용 (Pick, Omit, Partial, Record)
- Zod 4.x로 API 응답 런타임 검증

### State Management

- **TanStack Query**: 서버 상태 (작품, 챕터, 댓글 등)
- **Zustand**: 클라이언트 UI 상태 (인증, 테마, 모달)
- **React Hook Form**: 폼 상태 (로그인, 댓글 작성 등)

### React

- 비즈니스 로직은 커스텀 훅으로 분리 (src/hooks/)
- Props는 인터페이스로 명시적 정의
- useEffect 의존성 배열 정확히 관리

### Style

- Tailwind CSS 사용, `cn()` 유틸로 클래스 조합
- shadcn/ui 컴포넌트 우선 사용
- Radix UI primitives 활용

### Naming

- 컴포넌트: PascalCase
- 훅: use + camelCase
- 서비스: xxxService
- 타입: PascalCase (I 접두사 지양)
- 상수: UPPER_SNAKE_CASE

---

## Workflow Protocol

AI 모델이 따라야 할 4단계 프로토콜:

1. **Analyze**: 사용자 요청 파악, 관련 파일 경로 확인, 기존 코드베이스에서 유사 패턴 검색
2. **Plan**: 변경 계획 수립, 영향 받는 파일 나열, 데이터 구조 호환성 확인
3. **Implement**: 코드 작성, 기존 코드 파괴 방지, hooks/services 레이어 분리 유지
4. **Verify**: 타입 에러 확인, 의존성 배열 검증, 린트 에러 해결

---

## 핵심 Entity (Quick Reference)

| Entity | 설명 | 관련 Hook |
|--------|------|-----------|
| **User** | 사용자 (email, nickname, profileImageUrl) | `useAuth` |
| **Work** | 작품 (title, synopsis, genre, status) | `useWorks`, `useDiscovery` |
| **Chapter** | 챕터 (title, content, accessType, price) | `useChapters` |
| **Comment** | 계층형 댓글 (parentId로 대댓글 구현) | `useComments` |
| **Library** | 내 서재 (userId, workId 매핑) | `useLibrary` |
| **Bookmark** | 북마크/읽은 위치 | `useBookmark` |
| **ChapterRating** | 챕터 별점 (1~10점) | `useRating` |

**상세 타입**: `src/types/index.ts`

---

## 파일 구조 (File Structure)

```
src/
├── api/               # API 클라이언트 (client.ts)
├── adapters/          # 데이터 변환 어댑터 (graphSnapshotAdapter)
├── hooks/             # 커스텀 훅 (21개) ⭐ 핵심
│   ├── useAuth.ts, useAuthAction.ts    # 인증
│   ├── useWorks.ts, useChapters.ts     # 작품/챕터
│   ├── useDiscovery.ts                 # 탐색 (홈, 랭킹 등)
│   ├── useLibrary.ts, useBookmark.ts   # 서재/북마크
│   ├── useComments.ts, useRating.ts    # 댓글/별점
│   ├── usePublish.ts, useDraft.ts      # 발행/초안 (StoLink 연동)
│   ├── useChapterPurchase.ts           # 챕터 구매
│   ├── useSecureContent.ts             # 콘텐츠 보호
│   └── useCharacterGraph*.ts           # 캐릭터 관계도 (4개)
├── stores/            # Zustand 스토어 (3개)
│   ├── useAuthStore.ts                 # 인증 상태
│   ├── useAuthModalStore.ts            # 로그인 모달
│   └── useTheme.ts                     # 테마 설정
├── services/          # API 서비스 (2개)
│   ├── creditService.ts                # 크레딧 관련
│   └── paymentService.ts               # 결제 관련
├── components/
│   ├── ui/            # shadcn/ui 컴포넌트
│   ├── common/        # 공통 컴포넌트
│   ├── viewer/        # 챕터 뷰어
│   ├── comments/      # 댓글 시스템
│   ├── CharacterGraph/# 캐릭터 관계도 (D3 기반)
│   └── ...
├── pages/             # 페이지 컴포넌트
│   ├── HomePage.tsx, CategoryPage.tsx, RankingPage.tsx
│   ├── WorkDetailPage.tsx, ChapterViewerPage.tsx
│   ├── LibraryPage.tsx, WritePage.tsx
│   └── Auth/, Profile/, payment/
├── types/             # 타입 정의 (6개)
└── lib/               # 유틸리티 (cn 함수 등)
```

---

## Design System

### 컬러 팔레트

Tailwind CSS 기본 팔레트 + 커스텀 확장 사용

### 디자인 원칙

- **Modern & Clean**: 모던하고 깔끔한 독서 경험
- **가독성 우선**: 장시간 독서에 최적화된 타이포그래피
- **다크모드 지원**: useTheme 스토어로 테마 전환
- **모바일 친화적**: 반응형 레이아웃 필수

---

## Git 브랜치 전략 (3-Layer)

| 브랜치 | 용도 | 직접 Push | PR 대상 |
|--------|------|-----------|---------|
| `main` | 프로덕션 | ❌ 금지 | hotfix/\* |
| `dev` | 개발 통합 | ❌ 금지 | feature/\*, fix/\* |
| `feature/*` | 기능 개발 | ✅ 허용 | → dev |
| `fix/*` | 버그 수정 | ✅ 허용 | → dev |
| `hotfix/*` | 긴급 수정 | ✅ 허용 | → main |

---

## Commit Convention

```
feat: 새 기능 추가
fix: 버그 수정
docs: 문서 변경
style: 코드 포맷팅 (동작 변화 X)
refactor: 리팩토링 (동작 변화 X)
perf: 성능 개선
test: 테스트 추가
chore: 빌드, 설정, 의존성 변경
ci: CI/CD 설정 변경
hotfix: 긴급 수정
```

---

## StoLink 연동

Storead는 StoLink와 연동되어 작가 → 독자 워크플로우를 지원합니다:

| 항목 | StoLink (작가) | Storead (독자) |
|------|---------------|----------------|
| **Document** | 원본 문서 편집 | - |
| **Draft** | 발행 준비 | - |
| **Work** | projectId 연결 | 작품 열람 |
| **Chapter** | documentId 연결 | 챕터 열람 |

**발행 플로우**: StoLink Document → Draft → Storead Chapter

---

## Request Guidelines

1. 새 기능은 기존 데이터 구조(Work, Chapter 등)와 호환성 확인
2. 상태 추가 시 TanStack Query (서버) vs Zustand (클라이언트) 판단 필수
3. API 호출은 훅에서 직접 또는 services/ 레이어 사용
4. 결제 관련 로직은 서버 사이드 검증 필수
5. 콘텐츠 보호(DRM)는 useSecureContent 훅 패턴 준수
6. UI 컴포넌트는 shadcn/ui 스타일 가이드 준수
7. 기존 hooks/services 확인 후 중복 방지
8. **응답은 한국어로 작성**

---

## Commands

| 명령어 | 설명 |
|--------|------|
| `npm run dev` | 개발 서버 시작 (Vite) |
| `npm run build` | 프로덕션 빌드 |
| `npm run lint` | ESLint 검사 |
| `npm run preview` | 빌드 미리보기 |

---

## 버전 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|----------|
| 1.0 | 2026.01.08 | 최초 작성 (StoLink CLAUDE.md 기반) |
