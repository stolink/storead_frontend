/**
 * GraphSnapshot 어댑터
 * 백엔드 API의 graphSnapshot (Map<String, Object>)을
 * CharacterGraph 컴포넌트가 사용하는 타입으로 변환
 */
import type { Character } from "@/types/character";
import type { RelationshipLink } from "@/types/characterGraph";

// 백엔드 GraphSnapshot 타입
export interface GraphSnapshotDTO {
  nodes?: Array<{
    id: string;
    name: string;
    role: string;
    group?: string;
    imageUrl?: string;
    // Layout coordinates
    x?: number;
    y?: number;
    fx?: number;
    fy?: number;
  }>;
  links?: Array<{
    id: string;
    source: string;
    target: string;
    type: string;
    strength: number;
    description?: string;
  }>;
  profiles?: Record<
    string,
    {
      id: string;
      name: string;
      age?: number;
      gender?: string;
      personality?: string[];
      backstory?: string;
      imageUrl?: string;
    }
  >;
}

/**
 * GraphSnapshot DTO를 CharacterGraph Props로 변환
 * @param snapshot - 백엔드에서 받은 graphSnapshot
 * @returns Character[] 및 RelationshipLink[] 또는 null
 */
export function adaptGraphSnapshot(
  snapshot: GraphSnapshotDTO | null | undefined
): { characters: Character[]; links: RelationshipLink[] } | null {
  // null/undefined 체크
  if (!snapshot) {
    return null;
  }

  try {
    // 문자열인 경우 파싱
    let data: GraphSnapshotDTO = snapshot;
    if (typeof snapshot === "string") {
      try {
        data = JSON.parse(snapshot);
      } catch (e) {
        console.error("Failed to parse graphSnapshot string:", e);
        return null;
      }
    }

    if (!data.nodes || !data.links) {
      return null;
    }

    // 1. Nodes → Characters 변환
    const characters: Character[] = data.nodes.map((node) => {
      const profile = data.profiles?.[node.id];

      return {
        _id: node.id,
        projectId: "unknown",
        role: node.role as any,
        profile: {
          characterId: node.id,
          name: node.name,
          age: profile?.age ?? null,
          gender: profile?.gender ?? "unknown",
          race: "unknown",
          mbti: null,
          personality: profile?.personality ?? [],
          backstory: profile?.backstory ?? "",
          faction: {
            name: node.group ?? null,
            social: { rank: "", influence: 0, factionReputation: {} },
          },
        },
        aliases: [],
        status: "alive",
        appearance: {
          physique: "",
          skinTone: "",
          eyes: "",
          nose: "",
          mouth: "",
          hairStyle: "",
          hairColor: "",
          attire: [],
          expression: "",
          scarsTattoos: [],
          styleContext: { artStyle: "" },
        },
        personality: {
          coreTraits: profile?.personality ?? [],
          flaws: [],
          values: [],
        },
        relations: { graph: [], eventRefs: [], locationContext: "" },
        currentMood: { emotion: "", intensity: 0, trigger: null },
        inventory: [],
        meta: {
          createdAt: null,
          updatedAt: null,
          dataVersion: "",
          lockVersion: 0,
        },
        imageUrl: node.imageUrl,
        // Layout coordinates
        x: node.x,
        y: node.y,
        fx: node.fx,
        fy: node.fy,
      } as Character;
    });

    // 2. Links → RelationshipLinks 변환
    const getRelationType = (
      type: string
    ): "friendly" | "hostile" | "romantic" => {
      const t = type?.toLowerCase() || "";
      if (
        t.includes("hostile") ||
        t.includes("enemy") ||
        t.includes("rival") ||
        t.includes("적대")
      )
        return "hostile";
      if (t.includes("romantic") || t.includes("love") || t.includes("로맨스"))
        return "romantic";
      return "friendly";
    };

    const links: RelationshipLink[] = data.links.map((link) => ({
      id: link.id,
      source: link.source,
      target: link.target,
      type: getRelationType(link.type),
      strength: link.strength,
      description: link.description,
    }));

    return { characters, links };
  } catch (error) {
    console.error("Failed to adapt graphSnapshot:", error);
    return null;
  }
}
