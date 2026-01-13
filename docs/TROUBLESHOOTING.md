# 개발 로그 및 트러블슈팅

이 문서는 최근 커밋 내용과 개발 과정에서 발생한 주요 문제 및 해결 방법을 기록합니다.

---

## 📅 최근 커밋 요약 (Commit Summary)

### Frontend (`storead_frontend`)

| Commit ID | 태그/유형 | 메시지 | 주요 변경 사항 |
|:---:|:---:|---|---|
| `5da569c` | fix | Optimize rendering and improve type safety | `App.tsx` Layout import 수정, `usePublish` unused variable 경고 수정 (Build Error 해결) |
| `c886a81` | feat | Reply functionality & optimizations | 댓글/답글 기능 구현, 렌더링 최적화, 의존성 업데이트 |
| `75e73f1` | feat | Implement Reply functionality | 댓글 시스템 초기 구현 |

### Backend (`storead_spring`)

| Commit ID | 태그/유형 | 메시지 | 주요 변경 사항 |
|:---:|:---:|---|---|
| `e9f35bd` | feat | Discovery response update | `Discovery` API 응답 구조 개선 (Metadata 포함 등) |
| `7d68423` | feat | Community feature security | 커뮤니티 게시 기능 보안 강화 및 데이터 정합성 개선 |
| `8cb1fa5` | feat | Storead publishing flow | 작품 게시 플로우 및 메타데이터 처리 로직 추가 |

---

## 🛠️ 트러블슈팅 (Troubleshooting)

### 1. 프로젝트 생성 시 500 Internal Server Error

**증상:**
- 프로젝트 생성(Publish) 시도 시 백엔드에서 500 에러 발생.
- 로그 분석 결과 `MissingRequestHeaderException: Missing request header 'X-User-Id'`.

**원인:**
- 클라이언트에서 요청 시 `X-User-Id` 헤더가 누락됨.
- Security Context 또는 Interceptor 레벨에서 해당 헤더를 필수값으로 검증하고 있으나, 프론트엔드 요청에 포함되지 않음.

**해결:**
- 프론트엔드 API 클라이언트(`src/api/client.ts` 등) 또는 요청 시점에 `X-User-Id` 헤더를 명시적으로 포함하도록 수정 (또는 인증 방식에 따라 Token 기반으로 User ID를 추출하도록 백엔드 로직 보완 필요성 확인).

---

### 2. Google OAuth 로그인 실패 (DB Column Error)

**증상:**
- 구글 로그인 시도 시 `ERROR: null value in column "password" of relation "users"` 발생.
- DB에 사용자 정보 저장 실패.

**원인:**
- 소셜 로그인 사용자는 비밀번호가 필요 없으나, DB 스키마 또는 엔티티 설정에서 `password` 컬럼이 `NOT NULL`로 설정되어 있음.

**해결:**
- 사용자 생성 로직에서 더미 비밀번호를 설정하거나, DB 스키마의 `password` 컬럼을 `NULLable`로 변경.
- 프론트엔드: 로그인 실패 시 `/login` 리다이렉트 대신 로그인 모달(`AuthModal`)을 띄우도록 UX 개선.

---

### 3. 챕터 별점(Rating) 표시 오류

**증상:**
- 작품 상세 페이지에서 챕터별 평균 별점이 올바르게 표시되지 않음.
- 정수형 별점만 표시되거나 갱신이 안 됨.

**원인:**
- 프론트엔드 렌더링 로직에서 소수점 처리(반별, 0.5단위) 미흡.

**해결:**
- 별점 컴포넌트(`StarRating` 등)에서 평균 점수를 받아 `Math.round` 또는 반별 로직을 적용하여 정확한 시각적 피드백 제공.

---

### 4. 프론트엔드 빌드 에러 (Typescript/ESLint)

**증상:**
- `npm run build` 실행 시 에러 발생.
  1. `App.tsx`: Layout 컴포넌트 import 에러.
  2. `usePublish.ts`: Unused variable warning.

**원인:**
- `App.tsx`: `import Layout from ...` (default import) 사용했으나, `Layout.tsx`는 Named Export(`export { Layout }`)만 지원.
- `usePublish.ts`: `onSuccess` 콜백의 인자가 사용되지 않음에도 선언되어 있음.

**해결:**
- `App.tsx`: `import { Layout } from ...` (Named Import)로 수정.
- `usePublish.ts`: 미사용 인자 제거 또는 `_` 접두어 사용 (`_result`).

---

### 5. 좋아요(Like) 상태 지속성 문제

**증상:**
- 작품 상세 페이지에서 좋아요를 누른 후, 다른 페이지를 다녀오면 좋아요 상태(하트 색상, 카운트)가 초기화됨.

**원인:**
- React Query 캐시가 만료되거나, 네비게이션 간 상태 동기화가 제대로 이루어지지 않음. (백엔드 데이터는 갱신되었으나 프론트엔드가 Stale 데이터를 보여줌)

**해결:**
- `useLike` 훅에서 Mutation 성공(`onSuccess`) 시 `queryClient.invalidateQueries`를 호출하여 최신 데이터를 즉시 불러오도록 보장.
- 낙관적 업데이트(Optimistic Update) 적용으로 UX 개선.

---

### 6. D3 관계도 노드 렌더링 누락 (ID 매핑 이슈)

**증상:**
- StoLink에서 전달된 데이터를 기반으로 관계도를 렌더링할 때, 데이터는 정상이나 화면에 노드가 나타나지 않음.
- D3 Force Simulation 로그에서 링크의 `source`, `target`이 유효한 노드를 찾지 못함.

**원인:**
- StoLink 데이터의 캐릭터 ID가 D3 전처리 과정에서 객체로 변환되거나, 원본 ID 필드 매칭이 어긋남.

**해결:**
- `adaptGraphSnapshot` 함수에서 노드와 링크의 ID를 D3가 인식할 수 있는 문자열 형식으로 정규화하고, 시뮬레이션 시작 전 모든 링크가 유효한 노드를 참조하는지 검증하는 로직 추가.

---

### 7. Framer Motion `organic` Easing 에러

**증상:**
- 관계 상세 정보 확인 시 화면이 백화(Crash)되며 `Invalid easing type "organic"` 에러 발생.

**원인:**
- `RelationshipDetailSheet` 등에서 사용된 애니메이션 설정 중 `framer-motion`이 지원하지 않는 비표준 easing 값(`organic`)이 포함됨.

**해결:**
- 지원되는 표준 easing 값(`easeInOut`, `easeOut` 등) 또는 베지어 곡선으로 수정하여 해결.

---

### 8. 관계도 캔버스 시각적 불일치 (Global CSS 간섭)

**증상:**
- 관계도 캔버스 주변에 검은색 테두리가 생기거나 배경 이미지가 어긋나 보이는 현상.

**원인:**
- `storead` 전역 CSS에서 `canvas` 또는 `container` 요소에 공통적으로 적용된 border-radius, box-shadow 등이 Canvas 및 TiledBackground와 충돌.

**해결:**
- 관계도 전용 컨테이너에 CSS Isolation(`stolink-graph-container`)을 적용하고, 캔버스 요소에 대해 명시적으로 초기화 스타일(`reset-css`) 부여.

---

### 9. API 프록시 연결 불안정 (localhost vs 127.0.0.1)

**증상:**
- 개발 서버 구동 중 백엔드 API 호출이 간헐적으로 `ECONNREFUSED`로 실패.

**원인:**
- Node.js 버전이나 OS 환경에 따라 `localhost`가 IPv6(`::1`)로 먼저 해석되나 백엔드는 IPv4(`127.0.0.1`)에서만 대기할 경우 발생.

**해결:**
- `vite.config.ts`의 프록시 대상을 `http://127.0.0.1`로 명시하여 해결.
