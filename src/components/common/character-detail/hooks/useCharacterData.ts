import { useMemo } from "react";
import type { Character } from "@/types/character";

const relationLabels: Record<string, string> = {
  friendly: "우호",
  hostile: "적대",
  romantic: "연인",
  family: "가족",
  business: "비즈니스",
  mentor: "스승/제자",
  rival: "라이벌",
  colleague: "동료",
};

/**
 * 캐릭터 데이터에서 UI 표시용 데이터 추출 (Reader용, fetch 없음)
 */
export function useCharacterData(
  character: Character | null,
  allCharacters: Character[] = []
) {
  // 성격 특성 추출
  const traits = useMemo(() => {
    return character?.personality?.coreTraits || [];
  }, [character?.personality?.coreTraits]);

  // 관계 추출
  // target ID를 이름으로 변환
  const relationships = useMemo(() => {
    const graph = character?.relations?.graph || [];

    // ID -> Name 매핑 생성
    const nameMap = new Map<string, string>();
    allCharacters.forEach((char) => {
      nameMap.set(char._id, char.profile.name);
    });

    return graph.map((rel) => {
      // 1. 이름 찾기
      let targetName = nameMap.get(rel.target);

      if (!targetName) {
        targetName = rel.target;
      }

      const typeLabel =
        relationLabels[rel.type || "friendly"] || rel.type || "우호";
      const relationLabel = rel.description || typeLabel;

      return {
        name: targetName,
        relation: relationLabel,
      };
    });
  }, [character?.relations?.graph, allCharacters]);

  // 등장 챕터 (Reader에서는 아직 데이터가 없으므로 빈 배열 혹은 추후 구현)
  const appearances = useMemo(() => {
    return [];
  }, []);

  // 설명
  const description = useMemo(() => {
    return character?.profile?.backstory || "";
  }, [character?.profile?.backstory]);

  // 진행률 (기본값)
  const arcProgress = useMemo(() => {
    return 50;
  }, []);

  return {
    traits,
    relationships,
    appearances,
    description,
    arcProgress,
  };
}
