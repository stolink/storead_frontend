import type { CharacterRole, UIRelationType } from "@/types";

// =====================================================
// 🎨 색상 설정 (StoLink와 동일)
// =====================================================

// UI에서 사용하는 관계 타입 (Re-export)
export type { UIRelationType };

/**
 * RelationType을 UIRelationType으로 변환
 * 백엔드 타입을 UI 타입으로 매핑 (StoLink와 동일)
 */
export function toUIRelationType(type: string): UIRelationType {
  const normalized = type.toLowerCase();
  // Direct mapping if it matches known types
  const knownTypes: UIRelationType[] = [
    "ally",
    "enemy",
    "rival",
    "family",
    "betrayed",
    "knows",
    "protects",
    "mentor",
    "romantic",
    "neutral",
    "complex",
  ];

  if (knownTypes.includes(normalized as UIRelationType)) {
    return normalized as UIRelationType;
  }

  const mapping: Record<string, UIRelationType> = {
    // Legacy/Alternative mappings
    friendly: "ally",
    hostile: "enemy",
    master_servant: "mentor",
    coworker: "ally",
    classmate: "knows",
    love: "romantic",
    crush: "romantic",
    sibling: "family",
    parent: "family",
    child: "family",
    relative: "family",
  };
  return mapping[normalized] || "neutral";
}

/**
 * 관계 타입 문자열을 파싱하여 UIRelationType으로 변환 (StoLink와 동일)
 * includes() 기반 부분 문자열 매칭을 지원하여 다양한 관계 표현을 처리
 *
 * @param type - 관계 타입 문자열 (예: "hostile", "enemy", "적대", "family_bond" 등)
 * @returns UIRelationType - 표준화된 관계 타입 (StoLink 타입)
 */
export function parseRelationType(
  type: string | undefined | null,
): UIRelationType {
  if (!type) return "ally";

  const t = type.toLowerCase();

  // Direct match for known types (최우선)
  const knownTypes: UIRelationType[] = [
    "ally",
    "enemy",
    "rival",
    "family",
    "betrayed",
    "knows",
    "protects",
    "mentor",
    "romantic",
    "neutral",
    "complex",
  ];
  if (knownTypes.includes(t as UIRelationType)) {
    return t as UIRelationType;
  }

  // 1. Betrayed (배신) - 가장 높은 우선순위
  if (t.includes("betray") || t.includes("배신")) {
    return "betrayed";
  }

  // 2. Enemy (적대)
  if (
    t.includes("enemy") ||
    t.includes("hostile") ||
    t.includes("antagonist") ||
    t.includes("적대") ||
    t.includes("적")
  ) {
    return "enemy";
  }

  // 3. Rival (라이벌)
  if (t.includes("rival") || t.includes("라이벌") || t.includes("경쟁")) {
    return "rival";
  }

  // 4. Romantic (로맨스)
  if (
    t.includes("romantic") ||
    t.includes("love") ||
    t.includes("lover") ||
    t.includes("로맨스") ||
    t.includes("연인") ||
    t.includes("사랑")
  ) {
    return "romantic";
  }

  // 5. Family (가족)
  if (
    t.includes("family") ||
    t.includes("kin") ||
    t.includes("sibling") ||
    t.includes("brother") ||
    t.includes("sister") ||
    t.includes("parent") ||
    t.includes("child") ||
    t.includes("가족") ||
    t.includes("형제") ||
    t.includes("부모") ||
    t.includes("자녀")
  ) {
    return "family";
  }

  // 6. Mentor (멘토)
  if (
    t.includes("mentor") ||
    t.includes("teacher") ||
    t.includes("student") ||
    t.includes("master") ||
    t.includes("스승") ||
    t.includes("제자")
  ) {
    return "mentor";
  }

  // 7. Protects (보호)
  if (
    t.includes("protect") ||
    t.includes("guard") ||
    t.includes("보호") ||
    t.includes("지킴")
  ) {
    return "protects";
  }

  // 8. Ally (동맹/우호)
  if (
    t.includes("ally") ||
    t.includes("friend") ||
    t.includes("우호") ||
    t.includes("동맹") ||
    t.includes("친구")
  ) {
    return "ally";
  }

  // 9. Knows (안면)
  if (
    t.includes("know") ||
    t.includes("acquaintance") ||
    t.includes("안면") ||
    t.includes("지인")
  ) {
    return "knows";
  }

  // 10. Neutral (중립)
  if (
    t.includes("neutral") ||
    t.includes("coworker") ||
    t.includes("colleague") ||
    t.includes("동료") ||
    t.includes("중립")
  ) {
    return "neutral";
  }

  // 11. Complex (복합)
  if (t.includes("complex") || t.includes("복합")) {
    return "complex";
  }

  // 기본값: ally (우호 관계)
  return "ally";
}

export const MOCHA_COLORS = {
  500: "#8B7355", // Primary (Warm Brown)
  400: "#A89080", // Hover (Muted Taupe)
  700: "#574838", // Dark/Active
} as const;

// =====================================================
// 🎨 색상 설정 (Semantic Clustering) - StoLink와 동일
// =====================================================

// 메타 카테고리 (Semantic Clustering)
export type MetaCategory = "positive" | "negative" | "neutral";

export const META_CATEGORY_COLORS = {
  positive: "#15803D", // Green/Blue (안정, 결속)
  negative: "#F44336", // Red/Orange (긴장, 갈등)
  neutral: "#7C6BA8", // Purple/Grey (위계, 기능)
} as const;

// 관계 타입별 메타 카테고리 매핑 (StoLink와 동일)
export const RELATION_TO_META_CATEGORY: Record<UIRelationType, MetaCategory> = {
  ally: "positive",
  romantic: "positive",
  family: "positive",
  protects: "positive",
  mentor: "positive",
  enemy: "negative",
  rival: "negative",
  betrayed: "negative",
  neutral: "neutral",
  knows: "neutral",
  complex: "neutral",
};

// 관계 타입별 HEX 색상 (StoLink와 동일)
export const RELATION_COLORS_HEX = {
  // Positive Group
  ally: "#10B981", // Emerald 500 (Trust)
  romantic: "#EC4899", // Pink 500 (Love)
  family: "#0D9488", // Teal 600 (Firm Bond)
  protects: "#0EA5E9", // Sky 500 (Shield)
  mentor: "#F59E0B", // Amber 500 (Wisdom/Light)

  // Negative Group
  enemy: "#EF4444", // Red 500 (Danger)
  rival: "#F97316", // Orange 500 (Competition)
  betrayed: "#BE123C", // Rose 700 (Deep Blood/Scar)

  // Neutral/Complex
  neutral: "#94A3B8", // Slate 400 (Background)
  knows: "#A1A1AA", // Zinc 400 (Faint)
  complex: "#7C3AED", // Violet 600 (Mystery)
} as const;

// 관계 타입별 우선순위 (시각적 지배력) - StoLink와 동일
// 낮을수록 우선순위 높음 (1 = Top Priority)
export const RELATION_PRIORITY: Record<UIRelationType, number> = {
  // Critical / Danger (Red/Rose) - Must be seen first
  betrayed: 1,
  enemy: 2,

  // Special / Deep (Teal/Pink)
  family: 3,
  romantic: 4,

  // Active / Competition (Orange/Emerald)
  rival: 5,
  ally: 6,

  // Passive / Support (Amber/Sky)
  mentor: 7,
  protects: 8,

  // Neutral / Weak (Gray/Purple)
  complex: 9,
  knows: 10,
  neutral: 11,
};

// 관계 타입별 색상 팔레트 (StoLink와 동일)
export const RELATION_PALETTE: Record<
  UIRelationType,
  { weak: string; standard: string; deep: string }
> = {
  ally: {
    weak: "#6EE7B7",
    standard: RELATION_COLORS_HEX.ally,
    deep: "#065F46",
  },
  romantic: {
    weak: "#F9A8D4",
    standard: RELATION_COLORS_HEX.romantic,
    deep: "#831843",
  },
  family: {
    weak: "#5EEAD4",
    standard: RELATION_COLORS_HEX.family,
    deep: "#134E4A",
  },
  protects: {
    weak: "#7DD3FC",
    standard: RELATION_COLORS_HEX.protects,
    deep: "#0C4A6E",
  },
  mentor: {
    weak: "#FCD34D",
    standard: RELATION_COLORS_HEX.mentor,
    deep: "#78350F",
  },
  enemy: {
    weak: "#FCA5A5",
    standard: RELATION_COLORS_HEX.enemy,
    deep: "#7F1D1D",
  },
  rival: {
    weak: "#FDBA74",
    standard: RELATION_COLORS_HEX.rival,
    deep: "#7C2D12",
  },
  betrayed: {
    weak: "#FDA4AF",
    standard: RELATION_COLORS_HEX.betrayed,
    deep: "#881337",
  },
  neutral: {
    weak: "#CBD5E1",
    standard: RELATION_COLORS_HEX.neutral,
    deep: "#475569",
  },
  knows: {
    weak: "#E4E4E7",
    standard: RELATION_COLORS_HEX.knows,
    deep: "#52525B",
  },
  complex: {
    weak: "#C4B5FD",
    standard: RELATION_COLORS_HEX.complex,
    deep: "#5B21B6",
  },
};

// 관계 타입별 기본 색상 (Standard 기준)
export const RELATION_COLORS: Record<UIRelationType, string> = {
  ally: RELATION_COLORS_HEX.ally,
  enemy: RELATION_COLORS_HEX.enemy,
  rival: RELATION_COLORS_HEX.rival,
  family: RELATION_COLORS_HEX.family,
  betrayed: RELATION_COLORS_HEX.betrayed,
  knows: RELATION_COLORS_HEX.knows,
  protects: RELATION_COLORS_HEX.protects,
  mentor: RELATION_COLORS_HEX.mentor,
  romantic: RELATION_COLORS_HEX.romantic,
  neutral: RELATION_COLORS_HEX.neutral,
  complex: RELATION_COLORS_HEX.complex,
};

// 관계 타입별 배지 스타일 (Tailwind Classes) - StoLink와 동일
export const RELATION_BADGE_COLORS: Record<UIRelationType, string> = {
  ally: "bg-emerald-500 text-white border-emerald-500",
  enemy: "bg-rose-500 text-white border-rose-500",
  rival: "bg-orange-500 text-white border-orange-500",
  family: "bg-teal-600 text-white border-teal-600",
  betrayed: "bg-rose-700 text-white border-rose-700",
  knows: "bg-zinc-400 text-white border-zinc-400",
  protects: "bg-sky-500 text-white border-sky-500",
  mentor: "bg-amber-500 text-white border-amber-500",
  romantic: "bg-pink-400 text-white border-pink-400",
  neutral: "bg-slate-400 text-white border-slate-400",
  complex: "bg-purple-500 text-white border-purple-500",
};

// 관계 타입별 라벨 (한글) - StoLink와 동일
export const RELATION_LABELS: Record<UIRelationType, string> = {
  ally: "동맹",
  enemy: "적대",
  rival: "라이벌",
  family: "가족",
  betrayed: "배신",
  knows: "안면",
  protects: "보호",
  mentor: "멘토",
  romantic: "로맨스",
  neutral: "중립",
  complex: "복합",
};

// 역할별 라벨
export const ROLE_LABELS: Record<CharacterRole, string> = {
  protagonist: "주인공",
  antagonist: "적대자",
  supporting: "조연",
  mentor: "멘토",
  sidekick: "조력자",
  other: "기타",
};

// 역할별 색상 (노드 테두리 - StoLink와 동일)
export const ROLE_COLORS: Record<CharacterRole, string> = {
  protagonist: "#5F7D5F", // Sage Primary - 브랜드 일관성
  antagonist: "#B14B4B", // Russet Red - 차분한 위기감
  supporting: "#64748b", // Slate - 중립적 조연
  mentor: "#7C6BA8", // Muted Purple - 지혜로운 차분함
  sidekick: "#4B9F7D", // Emerald - 신뢰감 있는 조력자
  other: "#8B929E", // Sharkskin - 명확한 중립
};

// 캐릭터 상태별 배지 설정
export const STATUS_CONFIG: Record<
  string,
  { icon: string; color: string; label: string }
> = {
  alive: { icon: "✓", color: "#5B7B4B", label: "생존" },
  생존: { icon: "✓", color: "#5B7B4B", label: "생존" },
  dead: { icon: "☠", color: "#A33A3A", label: "사망" },
  사망: { icon: "☠", color: "#A33A3A", label: "사망" },
  unknown: { icon: "?", color: "#8B929E", label: "불명" },
  불명: { icon: "?", color: "#8B929E", label: "불명" },
  injured: { icon: "⚡", color: "#B8860B", label: "부상" },
  부상: { icon: "⚡", color: "#B8860B", label: "부상" },
  missing: { icon: "👁", color: "#5B6B7B", label: "실종" },
  실종: { icon: "👁", color: "#5B6B7B", label: "실종" },
};

// =====================================================
// 📏 노드 크기 설정
// =====================================================

export const NODE_SIZES = {
  protagonist: 100,
  default: 50,
  hover: 1.25,
} as const;

// 곡선형 엣지 설정
export const CURVE_FACTOR = 0.2;
export const MIN_CURVE_DISTANCE_SQ = 4;
export const MAX_CURVE_OFFSET = 60;

// =====================================================
// ⚡ Force Simulation 설정 (StoLink와 동일)
// =====================================================

export const FORCE_CONFIG = {
  charge: -1200,
  chargeDistanceMin: 80,
  chargeDistanceMax: 2500,
  linkDistance: 160,
  linkStrength: 0.35,
  centerStrength: 0.08,
  positionStrength: 0.02,
  collisionPadding: 60,
  collisionStrength: 0.85,

  // Dynamic Link Forces (Relationship-based) - StoLink와 동일
  dynamic: {
    ally: { distance: 140, strength: 0.4 },
    mentor: { distance: 150, strength: 0.35 },
    protects: { distance: 130, strength: 0.4 },
    family: { distance: 120, strength: 0.5 },
    romantic: { distance: 110, strength: 0.5 },
    knows: { distance: 180, strength: 0.25 },
    neutral: { distance: 170, strength: 0.3 },
    rival: { distance: 160, strength: 0.35 },
    enemy: { distance: 200, strength: 0.25 },
    betrayed: { distance: 190, strength: 0.25 },
    complex: { distance: 150, strength: 0.35 },
  },

  alphaDecay: 0.022,
  alphaMin: 0.001,
  velocityDecay: 0.6,
} as const;

// =====================================================
// 🔍 줌 설정
// =====================================================

export type ZoomLevel = "macro" | "meso" | "micro";

export const ZOOM_CONFIG = {
  min: 0.2,
  max: 4,
  initial: 1,
  transitionDuration: 300,
} as const;

export const SEMANTIC_ZOOM_CONFIG = {
  macro: 0.4,
  meso: 1.2,
  majorCharacterThreshold: 3,
} as const;

// =====================================================
// ✨ 애니메이션 설정
// =====================================================

export const ANIMATION = {
  highlightDuration: 200,
  dimOpacity: 0.12,
  normalOpacity: 1,
  entryDelay: 30,
  entryDuration: 500,
  pulseDuration: 3000,
  pulseScale: 1.08,
  hoverTransition: 150,
  reheatStrength: 0.3,
} as const;

// =====================================================
// 🌟 Semantic Force 상수 (StoLink와 동일)
// =====================================================

export const RELATION_ANGLES: Record<string, number> = {
  ally: 90,
  mentor: 45,
  protects: 135,
  family: 210,
  romantic: 150,
  knows: 270,
  neutral: 270,
  rival: 30,
  enemy: 0,
  betrayed: 330,
  complex: 45,
};

export const SEMANTIC_FORCE_CONFIG = {
  relationWeights: {
    ally: 0.6,
    protects: 0.7,
    mentor: 0.6,
    family: 0.5,
    romantic: 0.8,
    knows: 0.2,
    neutral: 0.3,
    rival: -0.1,
    enemy: -0.3,
    betrayed: -0.2,
    complex: 0.2,
  } as Record<string, number>,
  defaultRepulsion: -0.5,
  strengthMultiplier: 0.1,
  attractionDistance: 25,
  repulsionDistance: 50,
  interGroupDistance: 800,
};

// =====================================================
// 🌟 글로우/그라디언트 설정
// =====================================================

export const GLOW_CONFIG = {
  stdDeviation: 3,
  opacity: 0.6,
} as const;

// =====================================================
// 🌫️ 그룹 배경 색상 팔레트
// =====================================================

export const GROUP_COLORS = [
  "#E0E7FF",
  "#FAE8FF",
  "#DCFCE7",
  "#FFEDD5",
  "#F3E8FF",
  "#E0F2FE",
  "#FCE7F3",
  "#FEF3C7",
] as const;

// =====================================================
// 🏴 Faction 테두리 링 색상 (동적 할당용)
// =====================================================

export const FACTION_RING_COLORS = [
  "#6366F1",
  "#C4687A",
  "#4A9B7F",
  "#9B6B4A",
  "#8B5CF6",
  "#5B85C4",
  "#C45555",
  "#C49545",
  "#14B8A6",
  "#A855F7",
] as const;

export function getFactionColor(factionName: string | undefined): string {
  if (!factionName || factionName === "무소속") {
    return "#94A3B8";
  }
  const hash = factionName
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return FACTION_RING_COLORS[hash % FACTION_RING_COLORS.length];
}
