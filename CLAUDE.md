# CLAUDE.md - StoRead Project Constitution

> 이 문서는 AI 모델이 프로젝트 컨텍스트를 이해하고, 코드 품질과 디자인 철학을 일관되게 유지하기 위한 **프로젝트 헌법(Constitution)**입니다.

**버전:** 1.2
**최종 수정:** 2026년 1월 5일
**문서 상태:** 활성

---

<project_info>
<description>
StoRead - 독자용 웹소설/연재물 열람 플랫폼
작품 탐색, 챕터 읽기, 댓글, 좋아요, 북마크, 별점, 결제(크레딧) 기능을 제공하는 독자 중심 플랫폼
연동 프로젝트: StoLink (작가용 집필 도구)
</description>

<core_philosophy>
**"Deep Reading, Warm Connection"**
우리는 단순한 텍스트 뷰어가 아닌, 독자가 작품에 온전히 몰입할 수 있는 '디지털 서재'를 만듭니다. 기술적 탁월함(Performance)과 미학적 완성도(Aesthetic)를 통해 독서 경험을 예술의 경지로 끌어올립니다.
</core_philosophy>

<tech_stack>

- **Core**: React 19.0, TypeScript 5.9, Vite 6.3
- **State Management**:
  - Client: Zustand 5.0 (UI/Session)
  - Server: TanStack Query 5.90 (Caching/Sync)
  - Form: React Hook Form 7.69 + Zod 4.3
- **Styling & UI**: Tailwind CSS 4.1, shadcn/ui, Radix UI
- **Routing**: React Router DOM 7.11 (Data Router 방식 지향)
- **Network**: Axios 1.13 (Cookie Auth)
- **Payment**: Toss Payments SDK (`@tosspayments/payment-widget-sdk`)
- **Performance**: React Virtual (긴 목록/챕터), Lazy Loading
- **Backend**: Spring Boot 3.4, PostgreSQL
  </tech_stack>

<design_system>

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

| 이름     | HEX     | 용도             |
| -------- | ------- | ---------------- |
| Sage 50  | #F0F4EF | 밝은 배경        |
| Sage 400 | #7A9878 | 액센트           |
| Sage 500 | #5F7D5F | 버튼, 강조       |
| Sage 700 | #3E4C3E | 다크 모드 액센트 |

</design_system>

<frontend_design_guidelines>

## 1. Design Thinking: "Radical Softness"

일반적인 AI 생성 디자인(Generic AI Slop)을 거부하십시오. StoRead의 디자인은 **"따뜻함과 부드러움(Warm & Soft)"**이라는 미학적 목표를 극단적으로 추구해야 합니다.

- **Purpose**: 독자의 몰입을 방해하는 모든 요소를 제거하고, 텍스트가 가장 아름답게 보이는 환경을 제공한다.
- **Tone**: **Refined & Organic**. 기계적인 차가움이 아닌, 종이책의 질감과 온기를 디지털로 재해석한다. 모서리는 둥글고, 그림자는 깊으며, 여백은 숨을 쉰다.
- **Differentiation**:
  - 단순한 화이트/블랙 모드를 넘어, `Cloud Dancer`와 `Sage` 톤을 활용한 독보적인 분위기 연출.
  - 획일적인 UI 컴포넌트 배치를 지양하고, 콘텐츠(작품 표지, 텍스트)가 주인공이 되는 레이아웃 구성.

## 2. Aesthetic Execution Rules

- **Typography (Crucial)**:

  - 시스템 폰트(Arial, Roboto 등) 사용을 지양하고 **Pretendard**의 가변 두께와 자간을 정교하게 제어한다.
  - 본문 가독성을 위해 `line-height`, `letter-spacing`을 수학적으로 계산하여 적용한다.
  - 제목(Display)과 본문(Body)의 위계를 명확하고 우아하게 분리한다.

- **Color & Texture**:

  - 단색 배경 대신 미세한 **Grain Overlay**나 종이 질감을 CSS로 구현하여 깊이감을 더한다.
  - 그림자는 단순한 `box-shadow`가 아닌, 여러 겹의 레이어드 섀도우(Layered Shadows)를 사용하여 부드러운 입체감을 준다.

- **Motion & Interaction**:

  - **Micro-interactions**: 좋아요, 북마크 클릭 시 단순 색상 변경이 아닌, "튀어오르거나(Spring)", "채워지는(Fill)" 유기적인 애니메이션 구현.
  - **Page Transitions**: 페이지 이동 시 거친 끊김 없이, 콘텐츠가 부드럽게 페이드인/슬라이드 되도록 구현 (React Router View Transitions 활용 권장).
  - 텍스트 뷰어 진입 시 조명이 켜지듯 서서히 밝아지는 연출 고려.

- **Spatial Composition**:
  - 답답한 그리드 시스템을 탈피하고, 넉넉한 **Negative Space(여백)**를 활용하여 시선의 쉴 곳을 제공한다.
  - 비대칭적 균형(Asymmetrical Balance)을 통해 정적인 독서 화면에 리듬감을 부여한다.

## 3. Implementation Standard

- 미학적 비전을 구현하기 위해 복잡한 CSS/Tailwind 유틸리티 조합을 두려워하지 말 것.
- `framer-motion` 등의 라이브러리를 활용하여 고급스러운 움직임을 구현하되, 성능 저하(Layout Thrashing)가 없도록 주의할 것.
  </frontend_design_guidelines>

<core_entities>

- **Work**: 작품 (제목, 작가, 장르, 태그, 시놉시스, 상태)
- **Chapter**: 챕터 (ID, 번호, 제목, 본문 내용, 조회수, 등록일, 가격)
- **ViewerSettings**: 뷰어 설정 (폰트 크기, 줄간격, 배경 테마, 스크롤/페이지 모드)
- **Comment**: 댓글 (작성자, 내용, 타임스탬프, 대댓글 구조)
- **Reaction**: 좋아요, 이모지 반응
- **LibraryItem**: 서재에 담긴 작품 (마지막 읽은 위치 포함)
- **Credit**: 플랫폼 통화 (사용자 보유량, 충전/사용 내역)
- **Payment**: 결제 정보 (주문, 상태, 결제 수단)
  </core_entities>
  </project_info>

---

<coding_rules>
<typescript>

- **Strict Mode**: TypeScript Strict Mode 필수 준수.
- **Explicit Types**: `infer`에 의존하기보다, 핵심 도메인 모델은 명시적으로 타입 정의.
- **No Any**: `any` 사용 절대 금지. 필요 시 `unknown` + Type Guard 사용.
- **Validation**: API 응답 데이터는 Zod 스키마로 런타임 검증 수행 (특히 본문 콘텐츠).
  </typescript>

<state_management>

- **Server State (TanStack Query)**:

  - `queryKey`는 팩토리 패턴으로 관리 (`queryKeys.ts`).
  - `staleTime`: 작품 목록(5분), 챕터 본문(무제한/캐시 유지), 유저 정보(1분).
  - `prefetching`: 다음 챕터 이동 전 미리 데이터 로드 필수.

- **Client State (Zustand)**:
  _ 뷰어 설정(폰트, 테마) 등 **휘발되면 안 되는 설정**은 `persist` 미들웨어 사용.
  _ UI 일시적 상태(모달, 사이드바) 관리에 집중. \* **Rule**: Set, Map 등 직렬화 불가능한 객체는 Store에 저장 금지.
  </state_management>

<react_performance>

- **Rendering**:

  - `useMemo`, `useCallback`은 프로파일링 후 성능 병목이 확인된 지점에만 적용.
  - 뷰어 컴포넌트는 타이핑/스크롤 성능 최우선 최적화.

- **Virtualization**:

  - 댓글 목록, 챕터 목록 등 50개 이상의 아이템 렌더링 시 `Virtuoso` 또는 `React Virtual` 사용 필수.

- **Code Splitting**: \* 라우트 단위 Lazy Loading 적용 (`React.lazy` + `Suspense`).
  </react_performance>

<security_accessibility>

- **XSS Prevention**: 챕터 본문 렌더링 시 반드시 위생 처리(Sanitization) 된 HTML만 렌더링 (`dompurify` 사용).
- **A11y**:
  _ 모든 인터랙티브 요소에 `aria-label` 제공.
  _ 키보드 네비게이션(Tab) 지원 필수. \* 색약 사용자를 위한 테마 옵션 고려.
  </security_accessibility>

<style>
* **Tailwind**: `cn()` 유틸리티를 사용하여 클래스 병합 충돌 방지.
* **Structure**: 복잡한 스타일은 `cva`(class-variance-authority)로 변형 관리.
* **Magic Numbers**: 픽셀 값 하드코딩 지양, 디자인 토큰(rem, theme space) 사용.
</style>

</coding_rules>

---

<restrictions>
🔴 **MUST NOT (절대 금지)**:

- `any`, `as any` 타입 단언.
- 컴포넌트 내부에서 비즈니스 로직(데이터 가공, 필터링) 직접 구현 -> Custom Hook 분리.
- `useEffect` 의존성 배열 린트 경고 무시 (`eslint-disable-next-line`).
- 뷰어 렌더링 로직에서 `dangerouslySetInnerHTML`을 검증 없이 사용.
- 전역 상태(Zustand)에 API 데이터 캐싱 (TanStack Query 역할 침범).
- **Generic AI Style**:
  - 의미 없는 보라색 그라데이션 사용 금지.
  - 시스템 폰트 그대로 사용 금지.
  - 맥락 없는 카드 UI 남발 금지.

⚠️ **SHOULD NOT (지양)**:

- 단일 파일 400줄 초과.
- Prop Drilling 3단계 초과 (Composition 패턴으로 해결 권장).
- 불필요한 `div` 래퍼 남발 (Semantic Tag 사용: `article`, `section`, `main`).
  </restrictions>

---

<workflow_protocol>

1. **Understand (이해)**

   - "이 코드가 독자의 몰입을 돕는가?"를 먼저 자문할 것.
   - 요청된 기능의 `StoLink`(작가 툴)와의 연관성 확인.

2. **Architect (설계)**

   - UI 변경 시: `frontend-design` 가이드라인에 따른 미학적 접근 먼저 구상.
   - 로직 변경 시: Custom Hook 및 데이터 흐름(Query vs Store) 설계.

3. **Implement (구현)**

   - 코드 작성 시 타입 안전성과 가독성 확보.
   - 모션/애니메이션 추가 시 "부드러움"과 "성능"의 균형 유지.

4. **Review (검토)**
   _ 모바일 뷰포트에서의 가독성 확인.
   _ 다크 모드/라이트 모드 교차 검증. \* 린트 및 타입 에러 0건 확인.
   </workflow_protocol>

---

<file_structure>

```
src/
├── api/                 # API 클라이언트 및 엔드포인트
├── assets/              # 정적 리소스 (폰트, 이미지)
├── components/
│   ├── ui/              # shadcn/ui 기본 컴포넌트 (Button, Input 등)
│   ├── common/          # 프로젝트 전반 공용 컴포넌트
│   ├── PAYMENT/         # [NEW] 결제 및 크레딧 UI (CreditCharge, Success/Fail)
│   ├── viewer/          # 챕터 뷰어 핵심 컴포넌트 (ViewerContainer, Settings)
│   ├── works/           # 작품 관련 (Card, Grid, List)
│   ├── comments/        # 댓글 시스템
│   └── layout/          # 레이아웃 (Header, Sidebar)
├── hooks/               # Custom Hooks (비즈니스 로직)
│   ├── api/             # 서버 상태 (useWorks, useChapters, usePayment)
│   └── ui/              # UI 상태 (useViewerSettings)
├── services/            # [NEW] 도메인 로직 (paymentService, creditService)
├── lib/                 # 유틸리티 (utils, dompurify 설정)
├── pages/               # 라우트 페이지
│   ├── payment/         # [NEW] 결제 페이지 (CreditChargePage, PaymentSuccessPage)
│   └── ...
├── stores/              # Zustand 스토어 (useAuthStore, useTheme)
├── styles/              # 전역 스타일 및 폰트 설정
└── types/               # TypeScript 정의 (payment.ts, credit.ts 포함)
```

</file_structure>

---

<domain_glossary>
| 용어 | 설명 | 관련 경로 |
| --- | --- | --- |
| **Viewer** | 챕터 내용을 보여주는 핵심 인터페이스. 폰트/테마 커스텀 지원. | `src/components/viewer` |
| **Discovery** | 사용자가 좋아할 만한 작품을 찾는 탐색 경험. | `src/pages/DiscoveryPage.tsx` |
| **Library** | 사용자가 '소장' 또는 '구독'한 작품 목록. | `src/pages/LibraryPage.tsx` |
| **Credit** | 작품 열람을 위한 유료 재화. PG사 결제로 충전. | `src/services/creditService.ts` |
| **Payment** | 크레딧 충전을 위한 결제 프로세스 (Toss Payments). | `src/services/paymentService.ts` |
| **Infinite Scroll** | 콘텐츠의 끊김 없는 로딩 UX. | `useInfiniteQuery` |
| **Reaction** | 작품/댓글에 대한 가벼운 피드백 (좋아요 등). | `useReaction` |
</domain_glossary>

---

<request_guidelines>

1. **Design First**: UI 요청 시 "어떤 분위기를 연출할 것인가"를 먼저 설명해주십시오.
2. **Context Aware**: StoLink(작가용)와 데이터 구조가 호환되어야 함을 명심하십시오.
3. **Optimized**: 뷰어 성능과 관련된 코드는 보수적으로, 디자인 코드는 대담하게 작성하십시오.
4. **Secure**: 결제 및 인증 로직은 반드시 보안 가이드라인(Cookie Only 등)을 준수하십시오.
5. **Language**: 모든 설명과 주석, 커밋 메시지는 한국어를 기준으로 합니다.
   </request_guidelines>

---

## 버전 이력

| 버전 | 날짜       | 변경 내용                                         |
| ---- | ---------- | ------------------------------------------------- |
| 1.0  | 2026.01.04 | 최초 작성 (StoLink 기반)                          |
| 1.1  | 2026.01.05 | Frontend Design Skill 통합, 성능/보안 규정 강화   |
| 1.2  | 2026.01.05 | 결제 시스템(Toss Payments) 및 쿠키 기반 인증 반영 |
