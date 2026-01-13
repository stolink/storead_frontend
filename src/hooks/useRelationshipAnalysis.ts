import { useMemo } from "react";
import type { CharacterNode } from "@/types/characterGraph";
import type { RelationshipDeepAnalysisData } from "@/types/relationshipAnalysis";

/**
 * 캐릭터 관계 심층 분석 데이터를 가져오는 커스텀 훅
 * 현재는 Mock 데이터를 반환하지만, 향후 TanStack Query를 통한 서버 연동으로 대체됨
 * 
 * TODO: 백엔드 API 구현 시 useQuery 패턴으로 전환
 */
export function useRelationshipAnalysis(
    source: CharacterNode,
    target: CharacterNode,
    relationId?: string
) {
    // [STABILITY] 쿼리 키 또는 의존성 관리
    // 실제 API 연동 시 ['relationship-analysis', source.id, target.id, relationId] 등을 키로 사용

    const data = useMemo<RelationshipDeepAnalysisData>(() => {
        return {
            sourceCharacter: {
                id: source.id,
                name: source.name,
                imageUrl: source.imageUrl,
            },
            targetCharacter: {
                id: target.id,
                name: target.name,
                imageUrl: target.imageUrl,
            },
            sourceToTargetAttributes: {
                emotionalBond: 7.5,
                functionalTrust: 8.8,
                valueAlignment: 6.2,
                interdependence: 9.0,
                latentTension: 4.5,
            },
            targetToSourceAttributes: {
                emotionalBond: 6.5,
                functionalTrust: 7.2,
                valueAlignment: 5.8,
                interdependence: 8.0,
                latentTension: 3.5,
            },
            asymmetricStrength: {
                sourceToTarget: {
                    total: 80,
                    factors: [
                        { type: "trust", score: 8, weight: 0.8, category: "friendly" },
                        { type: "admiration", score: 6, weight: 0.6, category: "friendly" },
                    ],
                },
                targetToSource: {
                    total: 65,
                    factors: [
                        { type: "wary", score: 4, weight: 0.4, category: "hostile" },
                        { type: "need", score: 7, weight: 0.7, category: "friendly" },
                    ],
                },
            },
            relationshipTypes: ["ALLY", "RIVAL"],
            currentStrength: 80,
            description: `${source.name}와(과) ${target.name}의 관계는 복잡하게 얽혀 있습니다.`,
            since: "Ch.1",
            timeline: [
                {
                    eventId: "e1",
                    chapter: 1,
                    timestamp: null,
                    title: "첫 만남",
                    description: "도서관에서의 우연한 만남. 서로의 지식에 감탄함.",
                    importance: 6,
                    emotionalPolarity: 0.8,
                    cumulativeFriendly: 20,
                    cumulativeHostile: 0,
                    sentimentTrajectory: 20,
                },
            ],
            sharedScenes: [
                {
                    eventId: "s1",
                    chapter: "3",
                    title: "심야의 밀담",
                    description: "아무도 없는 복도에서 은밀하게 정보를 교환함.",
                    importance: 7,
                },
            ],
            insights: {
                decisiveTrigger: {
                    eventId: "e1",
                    title: "첫 만남",
                    summary: "모든 것의 시작점",
                    impact: 8,
                },
                keywords: ["신뢰", "전우애"],
            },
            warnings: [
                {
                    type: "asymmetry",
                    severity: "medium",
                    message: "신뢰도 비대칭 보임",
                },
            ],
        };
    }, [source, target, relationId]);

    return {
        data,
        isLoading: false,
        isError: false
    };
}
