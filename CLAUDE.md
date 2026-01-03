# CLAUDE.md - StoRead Project Constitution

> 이 문서는 AI 모델이 프로젝트 컨텍스트를 이해하고, 코드 품질을 일관되게 유지하기 위한 **프로젝트 헌법(Constitution)**입니다.

**버전:** 1.0
**최종 수정:** 2026년 1월 4일
**문서 상태:** 활성

---

<project_info>
<description>
StoRead - 독자용 웹소설/연재물 열람 플랫폼
작품 탐색, 챕터 읽기, 댓글, 좋아요, 북마크, 별점 기능을 제공하는 독자 중심 플랫폼
연동 프로젝트: StoLink (작가용 집필 도구)
</description>

<tech_stack>

<!-- 2026.01.04 기준 실제 버전 -->
- Framework: React 19.0, TypeScript 5.9, Vite 6.3
- State: Zustand 5.0 (전역), TanStack Query 5.90 (서버), React Hook Form 7.69 (폼)
- UI: Tailwind CSS 4.1, shadcn/ui, Radix UI
- Routing: React Router DOM 7.11
- Validation: Zod 4.3
- HTTP: Axios 1.13
- Backend: Spring Boot, PostgreSQL

</tech_stack>

<design_system>

<!-- Mocha & Cloud Dancer Design System (StoLink 동기화) -->

## Target Color Palette

### Primary (Mocha) & Surface (Cloud)

| 이름 (Token) | HEX     | 용도 및 특징               |
| ------------ | ------- | -------------------------- |
| Mocha 500    | #A47764 | 핵심 브랜드 색상           |
| Mocha 400    | #BD9B8D | Hover 상태 (고휘도)        |
| Mocha 700    | #7D5A4B | Dark/Active 상태           |
| Cloud 50     | #F1F0EC | 메인 배경색 (Cloud Dancer) |
| Espresso 900 | #3D302A | 본문 텍스트                |

### Status Colors

| 이름    | HEX     | 용도                    |
| ------- | ------- | ----------------------- |
| Success | #5B7B4B | 성공/긍정 피드백        |
| Warning | #B8860B | 경고 (가독성 확보 골드) |
| Error   | #A33A3A | 오류 (공학용 레드)      |

### Sage Colors (독자 플랫폼 특화)

| 이름     | HEX     | 용도                   |
| -------- | ------- | ---------------------- |
| Sage 50  | #F0F4EF | 밝은 배경              |
| Sage 400 | #7A9878 | 액센트                 |
| Sage 500 | #5F7D5F | 버튼, 강조             |
| Sage 700 | #3E4C3E | 다크 모드 액센트       |

## 디자인 원칙

- **Warm & Soft**: Mocha와 Cloud Colors를 사용하여 따뜻하고 부드러운 분위기 연출
- **가독성 확보**: Cloud Dancer 배경 위 Espresso 900 텍스트로 충분한 명도 대비 확보
- **일관성**: StoLink와 동일한 디자인 시스템 유지

</design_system>

<frontend_design_guidelines>

  <!-- Rules integrated from StoLink frontend-design skill -->

## Core Philosophy

- **Bold Integration**: 따뜻하고 부드러운 미학에 전념 (Warm & Soft)
- **Differentiation**: 독자 친화적이고 읽기 편안한 인터페이스 구현
- **Premium Feel**: 고급스러운 독서 경험 제공

## Design Quality Standards

- **Typography**:
  - Pretendard 폰트 사용 (heading, body 모두)
  - 한국어 최적화된 가독성 제공
- **Color & Theme**:
  - `mocha`, `cloud`, `sage` 팔레트 사용 (`tailwind.config.ts` 정의)
  - 다크/라이트 모드 지원
- **Motion & Interaction**:
  - CSS transitions 활용
  - hover, active 상태에 따른 시각적 피드백
- **Composition**:
  - 독서에 방해되지 않는 깔끔한 레이아웃
  - 콘텐츠 중심의 디자인

</frontend_design_guidelines>

<core_entities>

<!-- src/types/index.ts 기준 -->
- Work: 작품 (제목, 작가, 장르, 태그, 시놉시스, 상태)
- Chapter: 챕터 (작품 내 개별 에피소드)
- Comment: 댓글 (대댓글 지원)
- User: 사용자 (독자/작가)
- Like: 좋아요
- Bookmark: 북마크
- Rating: 별점 (챕터별 평가)
- ReadingProgress: 독서 진행 상황

</core_entities>
</project_info>

---

<coding_rules>
<typescript>
- MUST: TypeScript Strict Mode 준수
- MUST: 명시적 타입 정의 (export 함수/컴포넌트는 반드시 명시)
- MUST: 유틸리티 타입 적극 활용 (Pick, Omit, Partial, Record)
- SHOULD: API 응답은 Zod 4.x 스키마로 런타임 검증
- MUST NOT: `any` 타입 사용 금지 - `unknown` 또는 제네릭 사용
- MUST NOT: Non-null assertion (`!`) 남용 금지 - 방어적 프로그래밍
- MUST NOT: `as any` 타입 단언 금지
</typescript>

  <zustand>
    <!-- Zustand 5.x 특성 반영 -->
    - MUST: 도메인별 분리 (useAuthStore, useAuthModalStore, useTheme 등)
    - MUST: 서버 상태는 TanStack Query, 클라이언트 UI 상태만 Zustand
    - MUST: 직렬화 가능한 타입만 사용 (Set, Map 대신 배열/객체)
    - MUST NOT: Set, Map 등 직렬화 불가 타입 저장
    - MUST NOT: 전역 상태에 서버 데이터 직접 저장 (TanStack Query 캐시 사용)
  </zustand>

<tanstack_query>

<!-- TanStack Query 5.x 특성 -->
- MUST: queryKey는 배열 형태로 구조화 (예: ['works', workId])
- MUST: useQuery의 enabled 옵션으로 조건부 fetch
- MUST: useMutation으로 서버 상태 변경, onSuccess에서 invalidateQueries
- SHOULD: staleTime, gcTime 설정으로 캐시 전략 명시
- MUST NOT: useQuery 내부에서 직접 Zustand 업데이트
- MUST NOT: queryFn에서 예외 처리 없이 에러 throw (에러 바운더리 활용)

</tanstack_query>

  <react>
    <!-- React 19.x 특성 -->
    - MUST: 비즈니스 로직은 커스텀 훅으로 분리 (src/hooks/)
    - MUST: Props는 인터페이스로 명시적 정의
    - MUST: useEffect 의존성 배열 정확히 관리
    - SHOULD: useCallback/useMemo는 필요한 곳에만 (과도 사용 지양)
    - MUST NOT: 컴포넌트 내부에서 비즈니스 로직 직접 구현
    - MUST NOT: 3항 연산자 2중 이상 중첩
    - MUST NOT: useEffect에서 async 함수 직접 정의 (별도 함수 분리)
  </react>

  <style>
    - MUST: Tailwind CSS 사용, 인라인 스타일 금지
    - MUST: shadcn/ui 컴포넌트 우선 사용
    - MUST: 클래스 조합 시 `cn()` 유틸 사용 (src/lib/utils.ts)
    - SHOULD: 매직 스트링 지양, 상수 파일로 분리
  </style>

  <naming>
    - 변수명은 구체적으로: `data` → `workDataWithChapters`
    - 컴포넌트: PascalCase (예: `WorkDetailPage.tsx`)
    - 훅: use 접두사 + camelCase (예: `useWorks.ts`)
    - 타입: PascalCase, I 접두사 지양 (예: `Work`, not `IWork`)
    - 상수: UPPER_SNAKE_CASE (예: `DEFAULT_PAGE_SIZE`)
  </naming>
</coding_rules>

---

<restrictions>
  <!-- 이것만은 절대 하지 마 (Negative Constraints) -->

🔴 **MUST NOT (절대 금지)**:

- `any`, `as any` 타입 사용
- 인라인 스타일 (Tailwind 사용)
- console.log 커밋 (개발용 제외)
- Set, Map을 Zustand에 저장
- 중복 로직 작성 (기존 hooks 확인 필수)
- main/dev 브랜치에 직접 push
- PR 없이 main에 머지
- useEffect 의존성 배열 빈 배열로 회피 (린트 에러 무시)
- useQuery 내부에서 Zustand 직접 업데이트

⚠️ **SHOULD NOT (지양)**:

- 500줄 이상의 단일 파일
- 5개 이상의 props drilling (Context 또는 Zustand 사용)
- useEffect 내 async 함수 직접 정의
- 불필요한 리렌더링 유발 코드
- TanStack Query enabled 조건 없이 조건부 fetch
  </restrictions>

---

<workflow_protocol>

  <!-- AI 모델이 따라야 할 단계별 프로토콜 -->

1. **Analyze (분석)**
   - 사용자 요청을 파악하고 관련 파일 경로 확인
   - 기존 코드베이스에서 유사한 패턴 검색
   - src/hooks/ 에서 기존 로직 확인

2. **Plan (계획 수립)**
   - 변경 계획을 단계별로 수립
   - 영향 받는 파일과 컴포넌트 나열
   - 기존 데이터 구조(Work, Chapter 등)와의 호환성 확인
   - TanStack Query vs Zustand 선택 판단

3. **Implement (구현)**
   - 계획에 따라 코드 작성
   - 기존 코드 파괴하지 않는지 확인
   - shadcn/ui, Tailwind 패턴 준수
   - hooks 레이어 분리 유지

4. **Verify (검증)**
   - 타입 에러 발생 여부 확인 (`npm run build`)
   - 의존성 배열 정확성 확인
   - 린트 에러 해결 (`npm run lint`)
   </workflow_protocol>

---

<branch_strategy>

  <!-- 3-Layer 브랜치 전략 -->

| 브랜치      | 용도      | 직접 Push | PR 대상          |
| ----------- | --------- | --------- | ---------------- |
| `main`      | 프로덕션  | ❌ 금지   | hotfix/\*        |
| `dev`       | 개발 통합 | ❌ 금지   | feature/_, fix/_ |
| `feature/*` | 기능 개발 | ✅ 허용   | → dev            |
| `fix/*`     | 버그 수정 | ✅ 허용   | → dev            |
| `hotfix/*`  | 긴급 수정 | ✅ 허용   | → main           |

</branch_strategy>

---

<commit_convention>

  <!-- Conventional Commits -->

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

**예시**:

- `feat: 작품 상세 페이지 북마크 기능 추가`
- `fix(viewer): 챕터 뷰어 스크롤 오류 수정`
- `chore(deps): eslint 규칙 변경`
  </commit_convention>

---

<file_structure>

  <!-- 2026.01.04 기준 실제 구조 -->

```
src/
├── api/                 # API 클라이언트 (client.ts)
├── components/
│   ├── ui/              # shadcn/ui 컴포넌트
│   ├── layout/          # 레이아웃 (Header, Footer, Layout)
│   ├── auth/            # 인증 관련 (AuthCard, AuthModal)
│   ├── viewer/          # 챕터 뷰어 관련
│   ├── comments/        # 댓글 관련
│   ├── rating/          # 별점 관련
│   └── ...
├── hooks/               # 커스텀 훅 (14개)
│   ├── useAuth.ts       # 인증 상태
│   ├── useAuthAction.ts # 인증 액션
│   ├── useWorks.ts      # 작품 조회
│   ├── useChapters.ts   # 챕터 관리
│   ├── useComments.ts   # 댓글 CRUD
│   ├── useRating.ts     # 별점
│   ├── useWorkLike.ts   # 좋아요
│   ├── useBookmark.ts   # 북마크
│   ├── useLibrary.ts    # 서재 관리
│   ├── useDiscovery.ts  # 탐색/추천
│   ├── useDraft.ts      # 임시저장
│   ├── usePublish.ts    # 발행
│   ├── useExportChapter.ts # 내보내기
│   └── useSecureContent.ts # 보안 콘텐츠
├── stores/              # Zustand 스토어 (3개)
│   ├── useAuthStore.ts      # 인증 상태
│   ├── useAuthModalStore.ts # 인증 모달 상태
│   └── useTheme.ts          # 테마 상태
├── types/               # 타입 정의
│   └── index.ts         # 모든 타입 정의
├── pages/               # 페이지 컴포넌트
│   ├── HomePage.tsx
│   ├── LibraryPage.tsx
│   ├── WorkDetailPage.tsx
│   ├── ChapterViewerPage.tsx
│   ├── WritePage.tsx
│   ├── Auth/            # 인증 페이지
│   ├── Author/          # 작가 대시보드
│   └── Profile/         # 프로필
├── lib/                 # 유틸리티 (utils.ts - cn 함수)
├── data/                # 상수, 데모 데이터
└── assets/              # 정적 리소스
```

</file_structure>

---

<commands>
  <!-- 자주 사용하는 명령어 -->

| 명령어          | 설명                             |
| --------------- | -------------------------------- |
| `npm run dev`   | 개발 서버 시작 (localhost:5175)  |
| `npm run build` | 프로덕션 빌드 (tsc + vite build) |
| `npm run lint`  | ESLint 검사                      |
| `npm run preview` | 빌드 결과 미리보기             |

</commands>

---

<domain_glossary>

  <!-- StoRead 도메인 용어 정의 -->

| 용어       | 영문            | 설명                                               | 관련 타입/경로                    |
| ---------- | --------------- | -------------------------------------------------- | --------------------------------- |
| 작품       | Work            | 연재물/소설 단위. 여러 챕터로 구성                 | `Work`, `useWorks`                |
| 챕터       | Chapter         | 작품 내 개별 에피소드                              | `Chapter`, `useChapters`          |
| 서재       | Library         | 사용자가 북마크한 작품 목록                        | `LibraryPage`, `useLibrary`       |
| 탐색       | Discovery       | 작품 검색 및 추천                                  | `useDiscovery`                    |
| 뷰어       | Viewer          | 챕터 본문 열람 화면                                | `ChapterViewerPage`               |
| 독서모드   | Reading Mode    | 페이지/스크롤 방식 선택                            | `ViewerSettings`                  |
| 좋아요     | Like            | 작품에 대한 호감 표시                              | `useWorkLike`                     |
| 북마크     | Bookmark        | 작품 저장 (서재 추가)                              | `useBookmark`                     |
| 별점       | Rating          | 챕터별 평가 (1-5점)                                | `useRating`                       |

</domain_glossary>

---

<request_guidelines>

  <!-- 요청 시 주의사항 -->

1. 새 기능은 기존 데이터 구조(Work, Chapter 등)와 호환성 확인
2. 상태 추가 시 TanStack Query (서버) vs Zustand (클라이언트) 판단 필수
3. API 호출은 훅을 통해 TanStack Query 사용
4. UI 컴포넌트는 shadcn/ui 스타일 가이드 준수
5. 기존 hooks 확인 후 중복 방지
6. 응답은 한국어로 작성
7. StoLink와 디자인 시스템 일관성 유지
   </request_guidelines>

---

<related_projects>

  <!-- 연관 프로젝트 -->

| 프로젝트        | 설명                      | 연동                      |
| --------------- | ------------------------- | ------------------------- |
| stolink_frontend | 작가용 집필 플랫폼       | 디자인 시스템 공유        |
| storead_spring  | 백엔드 API 서버           | REST API 호출             |

</related_projects>

---

## 버전 이력

| 버전 | 날짜       | 변경 내용                                                                     |
| ---- | ---------- | ----------------------------------------------------------------------------- |
| 1.0  | 2026.01.04 | 최초 작성 - StoLink CLAUDE.md 기반으로 StoRead에 맞게 수정                    |
