# CLAUDE.md - StoRead Project Constitution

> 이 문서는 AI 모델이 프로젝트 컨텍스트를 이해하고, 코드 품질과 디자인 철학을 일관되게 유지하기 위한 **프로젝트 헌법(Constitution)**입니다.

**버전:** 1.3
**최종 수정:** 2026년 1월 10일
**문서 상태:** 활성

---

## 프로젝트 개요

**StoRead** - 독자용 웹소설/연재물 열람 플랫폼
작품 탐색, 챕터 읽기, 댓글, 좋아요, 북마크, 별점, 결제(크레딧) 기능을 제공하는 독자 중심 플랫폼
연동 프로젝트: StoLink (작가용 집필 도구)

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
- 뷰어 렌더링 로직에서 `dangerouslySetInnerHTML`을 검증 없이 사용

---

## 핵심 아키텍처 원칙 (MUST)

### TypeScript

- Strict Mode 준수
- 명시적 타입 정의 (export 함수/컴포넌트 필수)
- 유틸리티 타입 활용 (Pick, Omit, Partial, Record)
- Zod 4.x로 API 응답 런타임 검증

### State Management

- **TanStack Query**: 서버 상태 (작품, 챕터, 댓글 등)
  - `staleTime`: 작품 목록 5분, 챕터 본문 무제한 캐시
- **Zustand**: 클라이언트 UI 상태 (인증, 테마, 모달)
  - `persist`: 뷰어 설정(폰트 등) 저장
  - **직렬화 불가 객체(Set, Map) 저장 금지**
- **React Hook Form**: 폼 상태

### React & Performance

- 비즈니스 로직은 커스텀 훅으로 분리 (`src/hooks/`)
- Props는 인터페이스로 명시적 정의
- **Rendering**: 뷰어 컴포넌트는 타이핑/스크롤 성능 최우선 최적화
- **Virtualization**: 50개 이상의 리스트는 `Virtuoso` 또는 `React Virtual` 사용

### Style

- Tailwind CSS 사용, `cn()` 유틸로 클래스 조합
- shadcn/ui 컴포넌트 우선 사용
- **Design Thinking**: "Warm & Soft" (따뜻함과 부드러움) 미학 추구
- **Typography**: Pretendard 폰트 사용, 가독성 최우선

### Naming

- 컴포넌트: PascalCase
- 훅: useCamelCase
- 서비스: xxxService
- 타입: PascalCase (I 접두사 지양)
- 상수: UPPER_SNAKE_CASE

---

## Design System

### Target Color Palette

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

| 이름     | HEX     | 용도             |
| -------- | ------- | ---------------- |
| Sage 50  | #F0F4EF | 밝은 배경        |
| Sage 400 | #7A9878 | 액센트           |
| Sage 500 | #5F7D5F | 버튼, 강조       |
| Sage 700 | #3E4C3E | 다크 모드 액센트 |

### Design Principles (Warm & Soft)

- **Typography**: Pretendard 단일 폰트 사용, 가독성 `line-height` 최적화
- **Texture**: Grain Overlay 및 Paper Texture 활용
- **Interaction**: `framer-motion`을 활용한 부드러운 전환

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

## Commands

| 명령어 | 설명 |
|--------|------|
| `npm run dev` | 개발 서버 시작 (Vite) |
| `npm run build` | 프로덕션 빌드 |
| `npm run lint` | ESLint 검사 |
| `npm run preview` | 빌드 미리보기 |

---

## 🧪 테스트 (Tests)

### Unit & QA Tests (Vitest)

`src/__tests__/qa` 디렉토리에서 주요 기능과 API에 대한 테스트를 관리합니다.

- **API Tests**: `src/__tests__/qa/api` - 백엔드 API와의 연동을 검증합니다.
- **Scenario Tests**: `src/__tests__/qa/scenarios` - 시나리오 기반의 기능(Auth, Editor 등) 테스트를 수행합니다.

```bash
# 전체 테스트 실행
npm test

# 특정 파일 실행
npm test src/__tests__/qa/api
```

---

## Workflow Protocol

AI 모델이 따라야 할 4단계 프로토콜:

1. **Analyze (이해)**: 사용자 요청 파악, 관련 파일/코드 분석
2. **Plan (설계)**: 변경 계획 수립, 데이터 구조/호환성 확인
3. **Implement (구현)**: 코드 작성, 기존 코드 파괴 방지, Hooks 분리
4. **Verify (검토)**: 타입 에러 확인, 린트 에러 해결

---

## 참고 문서 구조 (docs/)

사람이 읽는 상세 문서:

```
docs/
└── TROUBLESHOOTING.md # 트러블슈팅 및 이슈 해결 기록
```

---

## 핵심 Entity (Quick Reference)

| Entity | 설명 | 관련 Hook |
|--------|------|-----------|
| **Work** | 작품 (제목, 작가, 장르, 태그, 시놉시스, 상태) | `useWorks` |
| **Chapter** | 챕터 (본문, 조회수, 가격) | `useChapters` |
| **Viewer** | 뷰어 설정 (폰트, 테마) | `useViewerSettings` |
| **Payment** | 결제 및 크레딧 | `usePayment`, `useCredit` |
| **Library** | 내 서재 (구독/소장) | `useLibrary` |

---

## 참고 문서 구조 (docs/)

사람이 읽는 상세 문서:

```
src/
├── api/               # API 클라이언트
├── hooks/             # 커스텀 훅 (비즈니스 로직)
├── services/          # 도메인 서비스 (Payment 등)
├── components/        # UI 및 뷰어 컴포넌트
├── pages/             # 라우트 페이지
├── stores/            # Zustand 스토어
└── types/             # 타입 정의
```

---

## Git 브랜치 전략 (3-Layer)

| 브랜치 | 용도 | 직접 Push | PR 대상 |
|--------|------|-----------|---------|
| `main` | 프로덕션 | ❌ 금지 | hotfix/\* |
| `dev` | 개발 통합 | ❌ 금지 | feature/\*, fix/\* |
| `feature/*` | 기능 개발 | ✅ 허용 | → dev |
| `fix/*` | 버그 수정 | ✅ 허용 | → dev |

---

## Request Guidelines

1. **Design First**: UI 요청 시 "Warm & Soft" 분위기 연출 우선
2. **Context Aware**: StoLink(작가툴) 데이터 호환성 확인
3. **Secure**: 결제/인증 로직 보안 가이드 준수
4. **Language**: 모든 응답은 한국어 기준

---

## 버전 이력

| 버전 | 날짜       | 변경 내용                                         |
| ---- | ---------- | ------------------------------------------------- |
| 1.3  | 2026.01.10 | 테스트 섹션 추가 및 문서 구조 동기화 (Mkd)        |
| 1.2  | 2026.01.05 | 결제 시스템 및 인증 반영                          |
| 1.0  | 2026.01.04 | 최초 작성                                         |
