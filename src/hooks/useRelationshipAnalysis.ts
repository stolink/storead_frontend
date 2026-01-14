import { useMemo } from "react";
import type { CharacterNode } from "@/types/characterGraph";
import type { RelationshipDeepAnalysisData } from "@/types/relationshipAnalysis";
import type { GraphSnapshotDTO } from "@/adapters/graphSnapshotAdapter";

/**
 * 캐릭터 관계 심층 분석 데이터를 graphSnapshot에서 조회하는 커스텀 훅
 * stolink에서 발행 시 계산된 데이터를 그대로 사용합니다.
 *
 * @param source - 소스 캐릭터 노드
 * @param target - 타겟 캐릭터 노드
 * @param graphSnapshot - 백엔드에서 받은 graphSnapshot (relationshipAnalysis 포함)
 * @returns 분석 데이터 및 상태 정보
 */
export function useRelationshipAnalysis(
    source: CharacterNode,
    target: CharacterNode,
    graphSnapshot: GraphSnapshotDTO | null | undefined,
): {
    data: RelationshipDeepAnalysisData | null;
    isLoading: boolean;
    isError: boolean;
} {
    const data = useMemo<RelationshipDeepAnalysisData | null>(() => {
        // [DEFENSIVE] graphSnapshot이 문자열로 들어온 경우 파싱 시도
        let snapshot = graphSnapshot;
        if (typeof snapshot === "string") {
            try {
                snapshot = JSON.parse(snapshot);
            } catch (e) {
                console.error("[useRelationshipAnalysis] Failed to parse graphSnapshot string:", e);
                return null;
            }
        }

        // snapshot 또는 relationshipAnalysis가 없으면 null 반환
        if (!snapshot?.relationshipAnalysis) {
            return null;
        }

        // 양방향 키 검색 (source-target 또는 target-source)
        const key1 = `${source.id}-${target.id}`;
        const key2 = `${target.id}-${source.id}`;

        const analysisFromKey1 = snapshot.relationshipAnalysis[key1];
        const analysisFromKey2 = snapshot.relationshipAnalysis[key2];

        // key1으로 찾은 경우 그대로 반환
        if (analysisFromKey1) {
            return analysisFromKey1;
        }

        // key2로 찾은 경우 source/target 스왑하여 반환
        if (analysisFromKey2) {
            return {
                ...analysisFromKey2,
                // 캐릭터 정보 스왑
                sourceCharacter: analysisFromKey2.targetCharacter,
                targetCharacter: analysisFromKey2.sourceCharacter,
                // 속성 스왑
                sourceToTargetAttributes: analysisFromKey2.targetToSourceAttributes,
                targetToSourceAttributes: analysisFromKey2.sourceToTargetAttributes,
                // 비대칭 강도 스왑
                asymmetricStrength: {
                    sourceToTarget: analysisFromKey2.asymmetricStrength.targetToSource,
                    targetToSource: analysisFromKey2.asymmetricStrength.sourceToTarget,
                },
            };
        }

        return null;
    }, [source.id, target.id, graphSnapshot]);

    return {
        data,
        isLoading: false,
        isError: !data,
    };
}
