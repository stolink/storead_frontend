import type * as d3 from "d3";
import type { CharacterRole } from "./character";

// =====================================================
// 📊 캐릭터 그래프 (D3.js Force Simulation) 타입
// =====================================================

/**
 * UI에서 사용하는 확장된 관계 타입 (StoLink와 동일)
 * ally, enemy, rival 등 세분화된 타입을 지원
 */
export type UIRelationType =
  | "ally"
  | "enemy"
  | "rival"
  | "family"
  | "betrayed"
  | "knows"
  | "protects"
  | "mentor"
  | "romantic"
  | "neutral"
  | "complex";

/**
 * D3 시뮬레이션용 노드 타입
 * Character._id를 id로 사용
 */
export interface CharacterNode extends d3.SimulationNodeDatum {
  id: string; // Character._id
  name: string; // profile.name
  role?: CharacterRole;
  group?: string; // profile.faction.name
  imageUrl?: string; // Optional - 별도 생성 또는 없음
  relationCount?: number;
  status?: string; // 캐릭터 상태 (alive, dead, unknown 등)
  // D3 런타임 필드 (시뮬레이션이 자동 추가)
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number;
  fy?: number;
}

/**
 * D3 시뮬레이션용 링크 타입
 * CharacterRelation에서 변환됨
 */
export interface RelationshipLink
  extends d3.SimulationLinkDatum<CharacterNode> {
  id: string;
  source: string | CharacterNode;
  target: string | CharacterNode;
  type: UIRelationType;
  strength: number;
  description?: string;
  publicStance?: string;
  privateFeeling?: string;
  revealedInChapter?: number;
  curvature?: number;
  flowDepth?: number;
  // Super Edge Logic
  visualPattern?: "braided" | "parallel" | "standard";
  relationTypes?: UIRelationType[];
  isSuperEdge?: boolean;
  bidirectional?: boolean;
  originalLinks?: RelationshipLink[];
  [key: string]: unknown;
}

/**
 * 그래프 데이터 구조
 */
export interface GraphData {
  nodes: CharacterNode[];
  links: RelationshipLink[];
}

/**
 * 컴포넌트 Props
 */
export interface CharacterGraphProps {
  characters: CharacterNode[];
  links: RelationshipLink[];
  onNodeClick?: (node: CharacterNode) => void;
  onLinkClick?: (link: RelationshipLink) => void;
  selectedNodeId?: string | null;
  relationTypeFilter?: string | "all";
  className?: string;
}

/**
 * 줌 상태
 */
export interface ZoomState {
  scale: number;
  x: number;
  y: number;
}

// =====================================================
// 🎬 고도화 기능용 타입 추가
// =====================================================

export interface TimelineState {
  currentChapter: number;
  totalChapters: number;
  isPlaying: boolean;
}

export interface RelationshipInsights {
  friendlyCount: number;
  hostileCount: number;
  romanticCount: number;
  familyCount: number;
  topConnectedCharacterId: string;
  tensionHotspots: string[]; // 갈등이 많은 캐릭터 ID들
}

export interface RelationshipEvent {
  id: string;
  chapterNumber: number;
  summary: string;
  emotionDelta: number; // -5 ~ +5
  timestamp: string;
}
