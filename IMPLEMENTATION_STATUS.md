# StoRead UI/UX 고도화 구현 현황

## 📋 구현 완료 항목

### Phase 1: 디자인 시스템 기반 구축 ✅

#### 1.1 글로벌 스타일 확장 (`src/index.css`)
- ✅ **글래스모피즘 시스템**
  - `.glass` - 기본 글래스 효과
  - `.glass-warm` - Cloud Dancer 틴트 글래스
  - `.glass-card` - 그라데이션 + 내부 그림자
  - `.glass-card-elevated` - 강화된 블러와 그림자
  - `.glass-dark` - 다크 모드용
  - 다크 모드 자동 대응 추가

- ✅ **Grain Texture 오버레이**
  - `.grain-overlay` - 기본 grain 효과 (opacity: 0.03)
  - `.grain-overlay-strong` - 강한 grain 효과 (opacity: 0.06)

- ✅ **Spotlight 효과**
  - `.spotlight-effect` - 마우스 따라다니는 Mocha 색상 glow
  - `.spotlight-effect-sage` - Sage 색상 spotlight

- ✅ **Staggered 애니메이션**
  - `.stagger-children` - 자동 delay 적용 (0.05s씩 증가)
  - `@keyframes staggerFadeUp` - 페이드업 애니메이션
  - `@keyframes staggerScaleIn` - 스케일인 애니메이션
  - `@keyframes staggerSlideUp` - 슬라이드업 애니메이션

- ✅ **카드 Glow 효과**
  - `.glow-mocha` - Mocha 색상 glow
  - `.glow-sage` - Sage 색상 glow
  - `.glow-gold` - 금색 glow (랭킹 1위용)
  - `.hover-glow` - 호버 시 glow

- ✅ **Typography 그라데이션**
  - `.text-warm-gradient` - Mocha 그라데이션 텍스트
  - `.text-sage-gradient` - Sage 그라데이션 텍스트

- ✅ **Fluid Bento Grid CSS**
  - 반응형 그리드 시스템 (모바일 2열, 태블릿 3열, 데스크톱 4열)
  - `.bento-hero`, `.bento-featured` 클래스
  - `.bento-item` 기본 스타일 및 hover 효과

- ✅ **페이지 전환 애니메이션**
  - `@keyframes pageEnter/pageExit`
  - `.page-transition-enter/exit` 클래스

- ✅ **스크롤 reveal 애니메이션**
  - `.reveal-on-scroll` + `.revealed` 조합

- ✅ **Empty State 애니메이션**
  - `.animate-float` - 부유 효과

- ✅ **버튼 Glow 효과**
  - `.btn-glow` - 호버 시 배경 glow

#### 1.2 Tailwind 확장 (`tailwind.config.ts`)
- ✅ **애니메이션 추가**
  - `fade-up`, `fade-in`, `scale-in`, `slide-up`, `slide-down`
  - `float`, `pulse-soft`, `shimmer`
  - `stagger-1` ~ `stagger-6` (delay 포함)

- ✅ **Keyframes 추가**
  - fadeUp, fadeIn, scaleIn, slideUp, slideDown
  - float, pulseSoft, shimmer

- ✅ **Timing Functions**
  - `organic` - cubic-bezier(0.19, 1, 0.22, 1)
  - `bounce-soft` - cubic-bezier(0.34, 1.56, 0.64, 1)

- ✅ **Backdrop Blur 확장**
  - `xs` (2px), `2xl` (40px), `3xl` (64px)

#### 1.3 Grain Texture (`public/textures/grain.svg`)
- ✅ SVG 노이즈 패턴 생성 (fractalNoise 기반)
- ✅ 경량 텍스처 파일 (타일링 가능)

---

### Phase 2: 공통 컴포넌트 생성 ✅

#### 2.1 GlassCard 컴포넌트 (`src/components/ui/glass-card.tsx`)
- ✅ **Variants**: default, warm, elevated, dark
- ✅ **Hover 효과**: none, lift, glow, scale
- ✅ **Spotlight 통합**: mocha, sage
- ✅ **Grain 오버레이**: subtle, strong
- ✅ **마우스 추적**: spotlight 효과를 위한 CSS 변수 업데이트
- ✅ **서브 컴포넌트**: GlassCardContent, GlassCardHeader, GlassCardFooter

#### 2.2 AnimatedContainer 컴포넌트 (`src/components/ui/animated-container.tsx`)
- ✅ **framer-motion 기반** 애니메이션 래퍼
- ✅ **미리 정의된 variants**: fadeUp, fadeIn, scaleIn, slideUp
- ✅ **StaggerContainer/StaggerItem**: 순차 등장 애니메이션
- ✅ **PageTransition**: 페이지 전환 래퍼
- ✅ **AnimatedPresenceWrapper**: AnimatePresence 래퍼
- ✅ **LayoutAnimation**: Bento Grid용 layout 애니메이션

#### 2.3 BentoGrid 컴포넌트 (`src/components/ui/bento-grid.tsx`)
- ✅ **BentoGrid**: 유동적 그리드 컨테이너 (LayoutGroup 포함)
- ✅ **BentoItem**: layout 애니메이션, 확장 가능
- ✅ **BentoCard**: 글래스모피즘 + 이미지/텍스트 자동 레이아웃
- ✅ **Priority 시스템**: hero (2x2), featured (2x1), standard (1x1), compact
- ✅ **ExpandableBentoCard**: 클릭 시 확장 기능
- ✅ **Spring 물리 애니메이션**: stiffness 300, damping 30

#### 2.4 useScrollAnimation 훅 (`src/hooks/useScrollAnimation.ts`)
- ✅ **useScrollAnimation**: IntersectionObserver 기반 뷰포트 진입 감지
- ✅ **useMultiScrollAnimation**: 다중 요소 stagger 애니메이션
- ✅ **useScrollProgress**: 스크롤 진행도 추적
- ✅ **useParallax**: 패럴랙스 효과

---

### Phase 3: 페이지별 개선 (부분 완료)

#### 3.1 Header 컴포넌트 ✅
- ✅ `glass-warm` 스타일 적용
- ✅ border 색상 변경 (`border-mocha-100/50`)
- ✅ transition 효과 추가

#### 3.2 BookCard 컴포넌트 ✅
- ✅ `glass-card` + `hover-glow` 스타일
- ✅ `spotlight-effect` + 마우스 추적 로직
- ✅ 이미지 hover 시 scale 애니메이션 (`ease-organic`)
- ✅ 장르 태그 `.glass` 스타일 적용
- ✅ 색상 통일 (zinc → mocha/espresso)

#### 3.3 FeaturedCarousel 컴포넌트 ✅
- ✅ 컨테이너 `glass-card-elevated` + `grain-overlay` 적용
- ✅ 네비게이션 버튼 `.glass` 스타일 + `hover:scale-105`
- ✅ 인디케이터 Mocha 색상 통일
- ✅ border-radius 증가 (rounded-2xl)

#### 3.4 RankingList 컴포넌트 ✅
- ✅ 컨테이너 `glass-card` + `rounded-2xl`
- ✅ "전체 순위 보기" 버튼 `.glass` 스타일
- ✅ Mocha 색상 통일

#### 3.5 HomePage ✅ (부분)
- ✅ 배경에 `grain-overlay` 추가
- ⚠️ **미완료**: 인기 작품 섹션 Bento Grid 적용

---

## 🚧 남은 구현 사항

### Phase 3: 페이지 개선 (계속)

#### 3.6 HomePage - Bento Grid 적용 ⏳
**파일**: `src/pages/HomePage.tsx`
- [ ] 인기 작품 섹션(6개 그리드)을 Bento Grid로 변경
  - 첫 2개: `priority="featured"` (2x1)
  - 나머지 4개: `priority="standard"` (1x1)
- [ ] StaggerContainer로 순차 등장 애니메이션
- [ ] 섹션별 AnimatedContainer 적용

**구현 예시**:
```tsx
import { BentoGrid, BentoCard } from '@/components/ui/bento-grid';
import { StaggerContainer, StaggerItem } from '@/components/ui/animated-container';

// 인기 작품 섹션
<StaggerContainer className="container mx-auto px-6 py-8">
  <StaggerItem>
    <div className="flex items-center gap-2 mb-6">
      <h2 className="text-2xl font-bold">인기 작품</h2>
      <ChevronRight className="w-5 h-5" />
    </div>
  </StaggerItem>

  <BentoGrid columns={4} gap="md">
    {works?.slice(0, 6).map((work, idx) => (
      <BentoCard
        key={work.id}
        priority={idx < 2 ? "featured" : "standard"}
        title={work.title}
        image={work.coverImageUrl}
        badge={<GenreBadge />}
        layoutId={`work-${work.id}`}
      />
    ))}
  </BentoGrid>
</StaggerContainer>
```

---

#### 3.7 WorkDetailPage 개선 ⏳
**파일**: `src/pages/WorkDetailPage.tsx`

- [ ] **히어로 섹션**: `glass-card` + `grain-overlay` 적용
- [ ] **표지 이미지**: 미세한 `glow-mocha` 효과
- [ ] **액션 버튼**: 모두 Mocha 색상 통일, `btn-glow` 효과
- [ ] **회차 목록 컨테이너**: `glass-card`
- [ ] **회차 아이템**: hover 시 `glass` 배경

**변경 예시**:
```tsx
{/* 히어로 섹션 */}
<div className="glass-card grain-overlay rounded-2xl shadow-lg p-8 mb-8">
  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
    {/* 표지 */}
    <div className="glow-mocha">
      <div className="aspect-[3/4] rounded-xl overflow-hidden">
        <img src={work.coverImageUrl} ... />
      </div>
    </div>
    ...
  </div>
</div>

{/* 회차 목록 */}
<div className="glass-card rounded-2xl p-8">
  ...
  {sortedChapters.map((chapter) => (
    <button className="... hover:glass hover:bg-mocha-50/50">
      ...
    </button>
  ))}
</div>
```

---

#### 3.8 LibraryPage - Bento Grid 적용 ⏳
**파일**: `src/pages/LibraryPage.tsx`

- [ ] LibraryCard → `BentoCard` 변환
- [ ] 최근 읽은 작품 3개: `priority="featured"`
- [ ] 나머지: `priority="standard"`
- [ ] Empty state: `animate-float` 아이콘

**변경 예시**:
```tsx
<BentoGrid columns={4} gap="lg" className="mb-8">
  {library?.map((item, idx) => (
    <BentoCard
      key={item.id}
      priority={idx < 3 ? "featured" : "standard"}
      title={item.work.title}
      image={item.work.coverImageUrl}
      badge={<span className="glass px-2 py-1">읽는 중</span>}
      footer={
        <button onClick={() => removeFromLibrary.mutate(item.workId)}>
          <Trash2 className="h-4 w-4" />
        </button>
      }
    />
  ))}
</BentoGrid>

{/* Empty State */}
<div className="text-center py-16">
  <BookOpen className="h-16 w-16 text-mocha-300 mx-auto mb-4 animate-float" />
  ...
</div>
```

---

#### 3.9 RankingPage 개선 ⏳
**파일**: `src/pages/RankingPage.tsx`

- [ ] **헤더**: Mocha-700 → Espresso-900 그라데이션 + `grain-overlay`
- [ ] **Top 3 카드**: `glass-card-elevated` 스타일
- [ ] **1위 카드**: `glow-gold` 효과
- [ ] **필터 탭**: Mocha 활성 색상

**변경 예시**:
```tsx
{/* Header */}
<div className="bg-gradient-to-br from-mocha-700 to-espresso-900 grain-overlay text-white pt-12 pb-24">
  <h1 className="text-5xl font-heading font-black">Ranking</h1>
</div>

{/* Top 3 */}
<TopRankCard
  work={top3[0]}
  rank={1}
  isMain
  className="glass-card-elevated glow-gold"
/>
```

---

#### 3.10 CategoryPage 개선 ⏳
**파일**: `src/pages/CategoryPage.tsx`

- [ ] **스티키 헤더**: `glass-warm` 적용
- [ ] **서브장르 탭**: Mocha 활성 스타일
- [ ] **필터 바**: `glass` 배경
- [ ] **리스트 아이템**: `glass-card` + `spotlight-effect`

**변경 예시**:
```tsx
{/* 헤더 */}
<div className="glass-warm border-b border-mocha-100/50 sticky top-16 z-20">
  <div className="container mx-auto px-6 py-6">
    <h1 className="text-4xl font-heading text-warm-gradient">{title}</h1>

    {/* 서브장르 탭 */}
    <div className="flex gap-2">
      {currentGroup.tabs.map((tab) => (
        <button className={selectedGenreValue === tab.value
          ? "bg-mocha-500 text-white"
          : "glass hover:bg-mocha-50"}>
          {tab.label}
        </button>
      ))}
    </div>
  </div>
</div>

{/* 필터 바 */}
<div className="glass backdrop-blur-md sticky top-32 z-10">
  ...
</div>
```

---

#### 3.11 ChapterViewerPage 개선 ⏳
**파일**: 찾지 못함 (구현 필요 시 확인)

- [ ] **뷰어 헤더**: `glass-warm` 스타일
- [ ] **설정 패널**: `glass-card` 스타일
- [ ] **FAB**: `glass` + spring 애니메이션

---

### Phase 4: 최종 검증 ⏳

#### 4.1 빌드 검증
```bash
npm run build
```
- [ ] TypeScript 에러 없음 확인
- [ ] 빌드 성공 확인

#### 4.2 린트 검증
```bash
npm run lint
```
- [ ] ESLint 에러 수정

#### 4.3 반응형 테스트
- [ ] 모바일 (375px): Bento Grid 2열 확인
- [ ] 태블릿 (768px): Bento Grid 3열 확인
- [ ] 데스크톱 (1280px): Bento Grid 4열 확인

#### 4.4 다크모드 테스트
- [ ] light/dark/sepia/ivory 테마에서 glass 스타일 확인

#### 4.5 성능 검증
- [ ] Backdrop-filter 성능 확인 (특히 모바일)
- [ ] 애니메이션 끊김 없는지 확인

---

## 📊 진행률 요약

| Phase | 작업 | 상태 | 진행률 |
|-------|------|------|--------|
| **Phase 1** | 디자인 시스템 기반 | ✅ 완료 | 100% |
| **Phase 2** | 공통 컴포넌트 | ✅ 완료 | 100% |
| **Phase 3** | 페이지 개선 | ⚠️ 진행중 | 40% |
| **Phase 4** | 검증 | ⏳ 대기 | 0% |

**전체 진행률**: **~60%**

---

## 🎯 우선순위 높은 남은 작업

1. **HomePage Bento Grid 적용** (가장 눈에 띄는 변화)
2. **WorkDetailPage 개선** (자주 방문하는 페이지)
3. **LibraryPage Bento Grid** (개인화 영역)
4. **빌드/린트 검증** (배포 전 필수)

---

## 💡 추가 개선 아이디어 (선택사항)

- [ ] **Page Transition**: 라우트 전환 시 AnimatePresence 적용
- [ ] **Micro-interactions**: 버튼 클릭 시 ripple 효과
- [ ] **Loading States**: Skeleton UI를 glass 스타일로 개선
- [ ] **Toast Notifications**: glass 스타일 토스트
- [ ] **Modal Overlays**: glass 배경 블러 모달

---

## 🔧 기술 노트

### 성능 최적화 팁
- Backdrop-filter는 GPU 가속을 사용하므로 레이어 수 제한 권장
- Grain texture는 SVG를 사용해 경량화 (반복 패턴)
- Stagger 애니메이션은 12개 이하로 제한 (성능 고려)

### 브라우저 호환성
- Backdrop-filter: Safari 9+, Chrome 76+, Firefox 103+
- CSS Grid subgrid: 미지원 브라우저에서는 fallback 필요
- framer-motion: IE 미지원 (현대 브라우저만)

### 접근성 고려사항
- Glass 배경 위 텍스트 대비율 확인 (최소 4.5:1)
- 애니메이션 `prefers-reduced-motion` 대응 필요
- Spotlight 효과는 순수 장식이므로 스크린리더 무시 (이미 적용됨)

---

**작성일**: 2026-01-18
**버전**: 1.0
**담당**: Claude Sonnet 4.5
