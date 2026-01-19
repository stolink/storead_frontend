# 관계도 고도화 구현 계획서

> **작성일**: 2026-01-19
> **목표**: StoLink의 그래프 기능을 참고하여 Storead 독자용 관계도 UX 개선

---

## 1. 현황 분석

### StoLink vs Storead 비교

| 항목 | StoLink (작가용) | Storead (독자용) |
|------|-----------------|-----------------|
| 메인 index.tsx | 1,294줄 | 109줄 |
| 렌더링 | D3 + Canvas | Canvas (force-graph-2d) |
| 분석 기능 | AnalysisSummaryModal, Insights | 없음 |
| 타임라인 | TimelineSlider (자동재생) | 내부 상태 필터링만 |
| 양방향 관계 | 독립 표시 | 단방향 표시 |

### 현재 Storead 관계도 구성
```
GraphModal.tsx (모달 컨테이너)
└── CharacterGraph/index.tsx (그래프 래퍼)
    └── CanvasGraph/index.tsx (실제 렌더링)
        ├── NetworkControls.tsx (좌측 상단 컨트롤)
        ├── RelationshipLegend.tsx (좌측 하단 범례)
        └── NetworkDetailPanelD3.tsx (우측 캐릭터 패널)
```

---

## 2. 고도화 목표

### 핵심 원칙
- **읽기 전용**: 편집 기능 없음 (StoLink와 차별화)
- **성능 유지**: Canvas 기반 렌더링 유지 (1000+ 노드 지원)
- **Warm & Soft**: 디자인 시스템 준수

### 목표 화면 구성
```
┌─────────────────────────────────────────────────────────────────┐
│  [헤더] 인물 관계도                              [도움말] [닫기] │
├─────────────────────────────────────────────────────────────────┤
│ ┌──────────┐                                    ┌─────────────┐ │
│ │ Network  │                                    │ Character   │ │
│ │ Controls │          [GRAPH CANVAS]            │ Detail      │ │
│ │          │                                    │ Panel       │ │
│ └──────────┘                                    └─────────────┘ │
│ ┌──────────┐           ┌────────────────┐       ┌─────────────┐ │
│ │ Legend   │           │ Timeline Slider │       │ Insights    │ │
│ └──────────┘           └────────────────┘       │ Mini Card   │ │
│                                                 └─────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. 구현 단계

### Phase 1: 모달 UI/UX 개선 (1-2일)

#### 1.1 GraphModal.tsx 리디자인

**현재 문제점:**
- 헤더가 단순함 (아이콘 + 텍스트만)
- 도움말/가이드 없음
- 푸터가 약함

**개선 사항:**
```tsx
// 새로운 헤더 구조
<header className="glass-header">
  <div className="flex items-center gap-3">
    <div className="p-2 bg-mocha-500 rounded-xl">
      <Network className="w-5 h-5 text-white" />
    </div>
    <div>
      <h2 className="font-bold">인물 관계도</h2>
      <p className="text-xs text-mocha-500">
        {characters.length}명의 인물 · {links.length}개의 관계
      </p>
    </div>
  </div>

  <div className="flex items-center gap-2">
    {/* 도움말 버튼 */}
    <HelpTooltip />
    {/* 닫기 버튼 */}
    <CloseButton />
  </div>
</header>
```

**새로운 스타일:**
- 글래스모피즘 헤더 (`bg-white/40 backdrop-blur-xl`)
- 통계 정보 표시 (인물 수, 관계 수)
- 도움말 툴팁 추가

#### 1.2 로딩 상태 개선

**현재:** 단순 스피너 + "관계도 구성 중..."

**개선:**
```tsx
<LoadingOverlay>
  <div className="flex flex-col items-center gap-4">
    {/* 애니메이션 네트워크 아이콘 */}
    <motion.div
      animate={{ scale: [1, 1.1, 1], rotate: [0, 180, 360] }}
      transition={{ duration: 2, repeat: Infinity }}
    >
      <Network className="w-12 h-12 text-mocha-500" />
    </motion.div>

    {/* 단계별 메시지 */}
    <div className="text-center">
      <p className="font-medium">관계도를 구성하고 있습니다</p>
      <p className="text-xs text-mocha-400 mt-1">
        {loadingStep === 1 && "캐릭터 정보 로딩..."}
        {loadingStep === 2 && "관계 데이터 분석..."}
        {loadingStep === 3 && "그래프 배치 계산..."}
      </p>
    </div>
  </div>
</LoadingOverlay>
```

---

### Phase 2: TimelineSlider 컴포넌트 (2-3일)

#### 2.1 새 파일 생성: `TimelineSlider.tsx`

**위치:** `src/components/CharacterGraph/TimelineSlider.tsx`

**기능:**
- 챕터별 관계 필터링
- Play/Pause 자동 재생
- 진행률 시각화

```tsx
interface TimelineSliderProps {
  currentChapter: number;
  totalChapters: number;
  onChange: (chapter: number) => void;
  isPlaying: boolean;
  onPlayToggle: () => void;
}

export function TimelineSlider({
  currentChapter,
  totalChapters,
  onChange,
  isPlaying,
  onPlayToggle,
}: TimelineSliderProps) {
  return (
    <motion.div
      className="absolute bottom-24 left-1/2 -translate-x-1/2 z-30"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
    >
      <div className="glass-card px-6 py-3 flex items-center gap-4">
        {/* Play/Pause 버튼 */}
        <Button variant="ghost" size="icon" onClick={onPlayToggle}>
          {isPlaying ? <Pause /> : <Play />}
        </Button>

        {/* 슬라이더 */}
        <div className="w-64">
          <Slider
            value={[currentChapter]}
            min={1}
            max={totalChapters}
            onValueChange={([v]) => onChange(v)}
          />
        </div>

        {/* 챕터 표시 */}
        <span className="text-sm font-medium min-w-[80px]">
          {currentChapter} / {totalChapters}화
        </span>
      </div>
    </motion.div>
  );
}
```

#### 2.2 자동 재생 로직

```tsx
// GraphModal.tsx에 추가
const [isTimelinePlaying, setIsTimelinePlaying] = useState(false);
const [currentChapter, setCurrentChapter] = useState(totalChapters);

useEffect(() => {
  if (!isTimelinePlaying) return;

  const interval = setInterval(() => {
    setCurrentChapter(prev => {
      if (prev >= totalChapters) {
        setIsTimelinePlaying(false);
        return totalChapters;
      }
      return prev + 1;
    });
  }, 1500); // 1.5초마다 다음 챕터

  return () => clearInterval(interval);
}, [isTimelinePlaying, totalChapters]);
```

---

### Phase 3: Insights 미니카드 (2-3일)

#### 3.1 새 파일 생성: `InsightsMiniCard.tsx`

**위치:** `src/components/CharacterGraph/InsightsMiniCard.tsx`

**기능:**
- 관계 통계 요약 (우호/적대/로맨스 비율)
- 핵심 인물 하이라이트
- 스포일러 토글

```tsx
interface InsightsMiniCardProps {
  characters: Character[];
  links: RelationshipLink[];
  currentChapter?: number;
}

export function InsightsMiniCard({
  characters,
  links,
  currentChapter,
}: InsightsMiniCardProps) {
  const stats = useMemo(() => {
    const friendly = links.filter(l => l.types?.includes('friendly')).length;
    const hostile = links.filter(l => l.types?.includes('hostile')).length;
    const romantic = links.filter(l => l.types?.includes('romantic')).length;

    // 가장 연결이 많은 캐릭터
    const connectionCounts = new Map<string, number>();
    links.forEach(link => {
      connectionCounts.set(link.source, (connectionCounts.get(link.source) || 0) + 1);
      connectionCounts.set(link.target, (connectionCounts.get(link.target) || 0) + 1);
    });

    const topCharacterId = [...connectionCounts.entries()]
      .sort((a, b) => b[1] - a[1])[0]?.[0];

    return { friendly, hostile, romantic, topCharacterId };
  }, [links]);

  const [showSpoiler, setShowSpoiler] = useState(false);

  return (
    <motion.div
      className="absolute bottom-24 right-6 z-30 w-64"
      initial={{ x: 20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
    >
      <div className="glass-card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-mocha-600">
            관계 분석
          </h4>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSpoiler(!showSpoiler)}
          >
            {showSpoiler ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
          </Button>
        </div>

        {/* 관계 타입 비율 */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 rounded-lg bg-emerald-50">
            <Users className="w-4 h-4 mx-auto text-emerald-500" />
            <p className="text-lg font-bold">{stats.friendly}</p>
            <p className="text-[10px] text-emerald-600">우호</p>
          </div>
          <div className="p-2 rounded-lg bg-rose-50">
            <Swords className="w-4 h-4 mx-auto text-rose-500" />
            <p className="text-lg font-bold">{stats.hostile}</p>
            <p className="text-[10px] text-rose-600">적대</p>
          </div>
          <div className="p-2 rounded-lg bg-pink-50">
            <Heart className="w-4 h-4 mx-auto text-pink-500" />
            <p className="text-lg font-bold">{stats.romantic}</p>
            <p className="text-[10px] text-pink-600">로맨스</p>
          </div>
        </div>

        {/* 핵심 인물 (스포일러 처리) */}
        {showSpoiler && stats.topCharacterId && (
          <div className="pt-2 border-t border-mocha-100">
            <p className="text-xs text-mocha-500">
              <Sparkles className="w-3 h-3 inline mr-1" />
              가장 많은 관계를 가진 인물
            </p>
            <p className="font-medium mt-1">
              {characters.find(c => c._id === stats.topCharacterId)?.profile?.name}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
```

---

### Phase 4: NetworkDetailPanelD3 개선 (2-3일)

#### 4.1 현재 문제점
- 정보가 텍스트 위주
- 관계 시각화 부족
- 스크롤 영역이 좁음

#### 4.2 개선 사항

```tsx
// 새로운 섹션 추가

// 1. 관계 강도 시각화
<section className="relationship-strength">
  <h4>관계 강도</h4>
  {connectedLinks.map(link => (
    <div key={link.id} className="flex items-center gap-2">
      <Avatar src={getOtherCharacter(link).imageUrl} />
      <span>{getOtherCharacter(link).name}</span>
      <div className="flex-1 h-2 bg-mocha-100 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-mocha-500"
          initial={{ width: 0 }}
          animate={{ width: `${link.strength * 20}%` }}
        />
      </div>
      <span className="text-xs">{link.strength}/5</span>
    </div>
  ))}
</section>

// 2. 감정 레이더 차트 (선택적)
<section className="emotion-radar">
  <h4>감정 분포</h4>
  <EmotionRadarChart
    data={[
      { emotion: '신뢰', value: trustScore },
      { emotion: '갈등', value: conflictScore },
      { emotion: '애정', value: affectionScore },
      { emotion: '경쟁', value: rivalryScore },
    ]}
  />
</section>

// 3. 관계 타임라인 (주요 이벤트)
<section className="relationship-timeline">
  <h4>주요 이벤트</h4>
  <div className="space-y-2">
    {events.slice(0, 3).map(event => (
      <div key={event.id} className="flex gap-2 text-xs">
        <span className="text-mocha-400">{event.chapterNumber}화</span>
        <span>{event.summary}</span>
      </div>
    ))}
  </div>
</section>
```

---

### Phase 5: 관계선 클릭 상세보기 개선 (2일)

#### 5.1 RelationshipDetailOverlay 개선

**현재:** 단순 팝업

**개선:**
```tsx
<motion.div className="relationship-detail-sheet">
  {/* 양방향 관계 표시 */}
  <div className="bidirectional-view">
    <div className="direction forward">
      <Avatar src={sourceChar.imageUrl} />
      <ArrowRight />
      <Avatar src={targetChar.imageUrl} />
      <Badge>{link.forwardType}</Badge>
    </div>

    {link.reverse && (
      <div className="direction reverse">
        <Avatar src={targetChar.imageUrl} />
        <ArrowRight />
        <Avatar src={sourceChar.imageUrl} />
        <Badge>{link.reverse.type}</Badge>
      </div>
    )}
  </div>

  {/* 관계 설명 */}
  <div className="description">
    <p>{link.description}</p>
  </div>

  {/* 관계 발전 히스토리 */}
  <div className="history">
    <h4>관계 발전 과정</h4>
    {link.events?.map(event => (
      <TimelineItem key={event.id} event={event} />
    ))}
  </div>
</motion.div>
```

---

## 4. 파일 변경 목록

### 신규 파일
```
src/components/CharacterGraph/
├── TimelineSlider.tsx          # 타임라인 컨트롤
├── InsightsMiniCard.tsx        # 관계 분석 미니카드
├── HelpTooltip.tsx             # 도움말 툴팁
└── components/
    └── EmotionRadarChart.tsx   # 감정 레이더 차트 (선택)
```

### 수정 파일
```
src/components/viewer/GraphModal.tsx           # 모달 UI 전면 개선
src/components/CharacterGraph/index.tsx        # Timeline 연동
src/components/CharacterGraph/NetworkDetailPanelD3.tsx  # 패널 개선
src/components/CharacterGraph/RelationshipDetailOverlay.tsx  # 양방향 표시
```

---

## 5. 타입 정의 추가

```typescript
// src/types/characterGraph.ts에 추가

interface TimelineState {
  currentChapter: number;
  totalChapters: number;
  isPlaying: boolean;
}

interface RelationshipInsights {
  friendlyCount: number;
  hostileCount: number;
  romanticCount: number;
  topConnectedCharacterId: string;
  tensionHotspots: string[]; // 갈등이 많은 캐릭터 ID들
}

interface RelationshipEvent {
  id: string;
  chapterNumber: number;
  summary: string;
  emotionDelta: number; // -5 ~ +5
  timestamp: string;
}
```

---

## 6. 우선순위 및 일정

| Phase | 기능 | 예상 기간 | 우선순위 |
|-------|------|----------|---------|
| 1 | 모달 UI/UX 개선 | 1-2일 | 🔴 높음 |
| 2 | TimelineSlider | 2-3일 | 🔴 높음 |
| 3 | InsightsMiniCard | 2-3일 | 🟡 중간 |
| 4 | NetworkDetailPanel 개선 | 2-3일 | 🟡 중간 |
| 5 | 관계선 상세보기 개선 | 2일 | 🟢 낮음 |

**총 예상 기간:** 1.5~2주

---

## 7. 주의사항

### 하지 말 것
- ❌ D3 기반으로 전환 (Canvas 성능이 더 좋음)
- ❌ 편집 기능 추가 (작가 전용 = StoLink)
- ❌ 과도한 애니메이션 (성능 저하)

### 지켜야 할 것
- ✅ Canvas 렌더링 유지
- ✅ 1000+ 노드 성능 보장
- ✅ 모바일 반응형 고려
- ✅ 스포일러 처리 (읽지 않은 챕터 정보 숨김)
- ✅ Warm & Soft 디자인 시스템 준수

---

## 8. 참고 자료

### StoLink 파일 위치
```
../sto-link/src/components/CharacterGraph/
├── AnalysisSummaryModal.tsx    # 분석 모달 참고
├── TimelineSlider.tsx          # 타임라인 참고
├── AnalyticalInsights.tsx      # Insights 참고
└── NetworkControls.tsx         # 컨트롤 UI 참고
```

### 디자인 토큰
```css
/* Warm & Soft 색상 */
--mocha-500: #A47764;
--cloud-50: #F1F0EC;
--espresso-900: #3D302A;

/* 글래스모피즘 */
.glass-card {
  @apply bg-white/40 backdrop-blur-xl border border-white/50 rounded-2xl shadow-xl;
}
```

---

*이 계획서를 기반으로 단계별 구현을 진행합니다.*
