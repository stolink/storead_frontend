/**
 * GraphSnapshot 어댑터
 * 백엔드 API의 graphSnapshot (Map<String, Object>)을
 * CharacterGraph 컴포넌트가 사용하는 타입으로 변환
 */
import type { Character, CharacterRole } from "@/types/character";
import type { RelationshipLink } from "@/types/characterGraph";
import type { RelationshipDeepAnalysisData } from "@/types/relationshipAnalysis";
import { parseRelationType } from "@/components/CharacterGraph/constants";

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
    publicStance?: string;
    privateFeeling?: string;
  }>;
  profiles?: Record<
    string,
    {
      id: string;
      name: string;
      age?: number;
      gender?: string;
      role?: string;
      imageUrl?: string;
      // Extended profile
      occupation?: string;
      birthplace?: string;
      family?: string;
      backstory?: string;
      faction?: string;
      aliases?: string[];
      firstAppearance?: string;
      // Personality (full object)
      personality?: {
        coreTraits?: string[];
        strengths?: string[];
        flaws?: string[];
        values?: string[];
      };
      // Appearance (full object)
      appearance?: {
        physique?: string;
        skinTone?: string;
        eyes?: string;
        nose?: string;
        mouth?: string;
        hairStyle?: string;
        hairColor?: string;
        attire?: string | string[];
        expression?: string;
        scarsTattoos?: string | string[];
        styleContext?: {
          artStyle?: string;
        };
      };
      // Motivation & Mood
      motivation?: string;
      currentMood?: {
        emotion?: string;
        trigger?: string | null;
        intensity?: number;
      };
      // Relations
      relations?: {
        graph?: Array<{
          target: string;
          type: string;
          relationTypes?: string[]; // Added
          description?: string;
          history?: string | null;
          strength?: number;
          publicStance?: string; // Added
          privateFeeling?: string; // Added
          revealedInChapter?: number; // Added
        }>;
      };
      // Meta
      meta?: {
        createdAt?: string | null;
        updatedAt?: string | null;
      };
    }
  >;
  /**
   * 관계별 심층 분석 데이터 (stolink에서 계산하여 전달)
   * Key: "{sourceId}-{targetId}" 형식
   */
  relationshipAnalysis?: Record<string, RelationshipDeepAnalysisData>;
}

/**
 * GraphSnapshot DTO를 CharacterGraph Props로 변환
 * @param snapshot - 백엔드에서 받은 graphSnapshot
 * @returns Character[] 및 RelationshipLink[] 또는 null
 */
export function adaptGraphSnapshot(
  snapshot: GraphSnapshotDTO | string | null | undefined,
): { characters: Character[]; links: RelationshipLink[] } | null {
  // null/undefined 체크
  if (!snapshot) {
    return null;
  }

  try {
    // 문자열인 경우 파싱
    let data: GraphSnapshotDTO;
    if (typeof snapshot === "string") {
      try {
        data = JSON.parse(snapshot);
      } catch (e) {
        console.error("Failed to parse graphSnapshot string:", e);
        return null;
      }
    } else {
      data = snapshot;
    }

    if (!data.nodes || !data.links) {
      return null;
    }

    // Role validation helper
    const isValidRole = (role: string): role is CharacterRole => {
      return ["protagonist", "antagonist", "supporting", "mentor", "sidekick", "other"].includes(role);
    };

    // 1. Nodes → Characters 변환
    const characters: Character[] = data.nodes.map((node) => {
      const profile = data.profiles?.[node.id];

      const rawRole = profile?.role || node.role;
      const role: CharacterRole = isValidRole(rawRole) ? rawRole : "other";

      // Helper to normalize attire/scarsTattoos to arrays
      const normalizeToArray = (
        val: string | string[] | undefined,
      ): string[] => {
        if (!val) return [];
        if (Array.isArray(val)) return val;
        return [val];
      };

      return {
        _id: node.id,
        id: node.id, // Added for D3 compatibility
        projectId: "unknown",
        role,
        profile: {
          characterId: node.id,
          name: profile?.name || node.name,
          age: profile?.age ?? null,
          gender: profile?.gender ?? "unknown",
          race: "unknown",
          mbti: null,
          personality: profile?.personality?.coreTraits ?? [],
          backstory: profile?.backstory ?? "",
          occupation: profile?.occupation,
          birthplace: profile?.birthplace,
          family: profile?.family,
          faction: {
            name: profile?.faction ?? node.group ?? null,
            social: { rank: "", influence: 0, factionReputation: {} },
          },
        },
        aliases: profile?.aliases ?? [],
        firstAppearance: profile?.firstAppearance,
        status: "alive",
        appearance: profile?.appearance
          ? {
              physique: profile.appearance.physique ?? "",
              skinTone: profile.appearance.skinTone ?? "",
              eyes: profile.appearance.eyes ?? "",
              nose: profile.appearance.nose ?? "",
              mouth: profile.appearance.mouth ?? "",
              hairStyle: profile.appearance.hairStyle ?? "",
              hairColor: profile.appearance.hairColor ?? "",
              attire: normalizeToArray(profile.appearance.attire),
              expression: profile.appearance.expression ?? "",
              scarsTattoos: normalizeToArray(profile.appearance.scarsTattoos),
              styleContext: {
                artStyle: profile.appearance.styleContext?.artStyle ?? "",
              },
            }
          : {
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
          coreTraits: profile?.personality?.coreTraits ?? [],
          strengths: profile?.personality?.strengths ?? [],
          flaws: profile?.personality?.flaws ?? [],
          values: profile?.personality?.values ?? [],
        },
        motivation: profile?.motivation,
        relations: (profile?.relations as unknown as Character["relations"]) ?? {
          graph: [],
          eventRefs: [],
          locationContext: "",
        },
        currentMood: profile?.currentMood ?? {
          emotion: "",
          intensity: 0,
          trigger: null,
        },
        inventory: [],
        meta: profile?.meta
          ? {
              createdAt: profile.meta.createdAt ?? null,
              updatedAt: profile.meta.updatedAt ?? null,
              dataVersion: "",
              lockVersion: 0,
            }
          : {
              createdAt: null,
              updatedAt: null,
              dataVersion: "",
              lockVersion: 0,
            },
        imageUrl: profile?.imageUrl || node.imageUrl,
        // Layout coordinates (Respect fixed positions from snapshot)
        x: node.x,
        y: node.y,
        fx: node.fx !== undefined ? node.fx : node.x,
        fy: node.fy !== undefined ? node.fy : node.y,
      } as Character;
    });

    // 2. Links → RelationshipLinks 변환
    // parseRelationType 공통 함수 사용 (constants.ts)
    const links: RelationshipLink[] = data.links.map((link) => ({
      id: link.id || `${link.source}-${link.target}`,
      source: link.source,
      target: link.target,
      type: parseRelationType(link.type),
      strength: link.strength,
      description: link.description,
      publicStance: link.publicStance,
      privateFeeling: link.privateFeeling,
    }));

    return { characters, links };
  } catch (error: unknown) {
    console.error("Failed to adapt graphSnapshot:", error);
    return null;
  }
}