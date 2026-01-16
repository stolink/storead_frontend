import { memo, useRef, useEffect, useMemo, useState } from "react";
import * as d3 from "d3";
import type { CharacterNode } from "@/types";
import {
  NODE_SIZES,
  ROLE_COLORS,
  ANIMATION,
  STATUS_CONFIG,
  getFactionColor,
} from "./constants";
import { getInitial, truncateName, ROLE_GRADIENTS } from "./utils";

interface NodeRendererProps {
  node: CharacterNode;
  isSelected: boolean;
  isHighlighted: boolean;
  isDimmed: boolean;
  onClick: (node: CharacterNode) => void;
  onHover?: (nodeId: string | null) => void;
  dragBehavior: d3.DragBehavior<
    SVGGElement,
    CharacterNode,
    CharacterNode | unknown
  >;
  /** 현재 줌 레벨 (0.2 ~ 4) - 라벨 가시성 조절용 */
  zoomScale?: number;
  /** 분석 워크플로우: 변경 유형 */
  changeType?: "new" | "updated" | null;
  /** AI Insights */
  showLogicCheck?: boolean;
  /** Stolink 스타일(이니셜 아바타 우선) 적용 여부 */
  useStolinkStyle?: boolean;
  /** 노드 더블 클릭 (고정 해제용) */
  onDoubleClick?: (node: CharacterNode) => void;
}

/**
 * SVG 노드 렌더러 컴포넌트 - Enhanced with Initial Avatars & Pill Labels
 * - 이미지 없는 노드: 역할별 그라데이션 + 이니셜 표시
 * - 라벨: Pill 배경 + 줌 반응형 가시성 + 텍스트 truncation
 */
export const NodeRenderer = memo(function NodeRenderer({
  node,
  isSelected,
  isHighlighted,
  isDimmed,
  onClick,
  onHover,
  dragBehavior,
  zoomScale = 1,
  changeType,
  showLogicCheck = false,
  useStolinkStyle = true,
  onDoubleClick,
}: NodeRendererProps) {
  // Ref for D3 Drag Attachment
  const elementRef = useRef<SVGGElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Data Binding & Drag Attachment
  useEffect(() => {
    if (elementRef.current) {
      const selection = d3.select(elementRef.current).data([node]);
      if (dragBehavior) {
        selection.call(dragBehavior);
      }
    }
  }, [node, dragBehavior]);

  const isProtagonist = node.role === "protagonist";
  const isImportant = isProtagonist;

  const baseSize = isProtagonist ? NODE_SIZES.protagonist : NODE_SIZES.default;
  const importanceFactor = isProtagonist ? 2.5 : 1.5;
  const dynamicBonus = (node.relationCount || 0) * importanceFactor;
  const finalSize = Math.min(baseSize + dynamicBonus, 180);
  const radius = finalSize / 2;
  const roleColor = ROLE_COLORS[node.role || "other"];

  const isIsolated = (node.relationCount || 0) === 0;

  // 줌 반응형 라벨 설정
  const showLabel = zoomScale > 0.35;
  const labelOpacity = Math.max(0, Math.min(1, (zoomScale - 0.35) * 3));

  // 라벨 텍스트 처리 (truncation)
  const displayName = useMemo(() => {
    const maxLen = isImportant ? 12 : 8;
    return truncateName(node.name, maxLen);
  }, [node.name, isImportant]);

  // Initial-based avatar (이미지 없는 노드용)
  const initial = getInitial(node.name);
  const gradient = ROLE_GRADIENTS[node.role || "other"] || ROLE_GRADIENTS.other;

  if (node.x === undefined || node.y === undefined) {
    return null;
  }

  return (
    <g
      ref={elementRef}
      className="node-group"
      transform={`translate(${node.x}, ${node.y})`}
      onClick={() => onClick(node)}
      onDoubleClick={(e) => {
        e.stopPropagation();
        onDoubleClick?.(node);
      }}
      onMouseEnter={() => {
        setIsHovered(true);
        if (onHover) onHover(node.id);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        if (onHover) onHover(null);
      }}
      style={{
        cursor: "pointer",
        opacity: isDimmed ? ANIMATION.dimOpacity : ANIMATION.normalOpacity,
        transition: `opacity ${ANIMATION.highlightDuration}ms ease-out`,
      }}
    >
      {/* 글로우/펄스 효과 (중요 인물/선택/하이라이트) */}
      {(isImportant || isSelected || isHighlighted) && (
        <>
          <circle
            r={radius + (isImportant ? 16 : 12)}
            fill={isSelected ? "#5F7D5F" : roleColor}
            opacity={isImportant ? 0.15 : 0.12}
            pointerEvents="none"
          />
          {(isHighlighted || isImportant) && (
            <circle
              r={radius + (isImportant ? 8 : 4)}
              fill="none"
              stroke={roleColor}
              strokeWidth={isImportant ? 3 : 2}
              opacity={0.5}
              style={{
                animation: `pulse ${ANIMATION.pulseDuration}ms ease-in-out infinite`,
              }}
            />
          )}
        </>
      )}

      {/* 선택 링 */}
      {isSelected && (
        <circle
          r={radius + 5}
          fill="none"
          stroke="#5F7D5F"
          strokeWidth={2.5}
          opacity={0.8}
        />
      )}

      {/* 그림자 (중요 인물만) */}
      {isImportant && (
        <circle
          r={radius + 2}
          fill="rgba(0,0,0,0.1)"
          transform="translate(1, 2)"
          pointerEvents="none"
        />
      )}

      {/* 메인 원 */}
      <circle
        r={radius}
        fill={isImportant ? "url(#node-gradient-common)" : "#F5F5F4"}
        stroke={roleColor}
        strokeWidth={isProtagonist ? 4 : 2}
        strokeDasharray={isIsolated ? "4 4" : undefined}
        style={{
          transition: `stroke-width ${ANIMATION.hoverTransition}ms ease`,
        }}
      />

      {/* 고립된 노드 경고 아이콘 */}
      {isIsolated && (
        <circle
          r={radius + 8}
          fill="none"
          stroke="#EF4444"
          strokeWidth={1.5}
          strokeDasharray="2 2"
          opacity={0.6}
        />
      )}

      {/* Faction 테두리 링 - 진영 식별 */}
      {node.group && node.group !== "무소속" && (
        <circle
          r={radius + 6}
          fill="none"
          stroke={getFactionColor(node.group)}
          strokeWidth={2.5}
          opacity={isDimmed ? 0.3 : 0.85}
          strokeDasharray={isProtagonist ? undefined : "6 3"}
          className="pointer-events-none"
          style={{
            transition: `opacity ${ANIMATION.highlightDuration}ms ease-out`,
          }}
        />
      )}

      {/* 아바타: 이미지 또는 이니셜 기반 */}
      {node.imageUrl && !useStolinkStyle ? (
        <>
          <defs>
            <clipPath id={`clip-${node.id}`}>
              <circle r={radius - 3} />
            </clipPath>
          </defs>
          <image
            href={node.imageUrl}
            x={-(radius - 3)}
            y={-(radius - 3)}
            width={(radius - 3) * 2}
            height={(radius - 3) * 2}
            clipPath={`url(#clip-${node.id})`}
            preserveAspectRatio="xMidYMid slice"
            style={{
              filter: isDimmed ? "grayscale(80%) brightness(0.9)" : "none",
              transition: `filter ${ANIMATION.highlightDuration}ms ease`,
            }}
          />
        </>
      ) : (
        <>
          {/* 이니셜 기반 아바타 - 역할별 그라데이션 */}
          <defs>
            <linearGradient
              id={`initial-gradient-${node.id}`}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor={gradient.from} />
              <stop offset="100%" stopColor={gradient.to} />
            </linearGradient>
          </defs>
          <circle
            r={radius - 3}
            fill={`url(#initial-gradient-${node.id})`}
            style={{
              filter: isDimmed ? "grayscale(80%) brightness(0.9)" : "none",
              transition: `filter ${ANIMATION.highlightDuration}ms ease`,
            }}
          />
          <text
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={isImportant ? radius * 0.8 : radius * 0.7}
            fontWeight={700}
            fill="white"
            style={{
              userSelect: "none",
              textShadow: "0 1px 2px rgba(0,0,0,0.3)",
            }}
          >
            {initial}
          </text>
        </>
      )}

      {/* 상태 배지 (Status Badge) */}
      {(() => {
        // Change Indicator and Status Badge logic
        // Updated for Storead (With Editing Support) - Consistent with Stolink
        // Assuming we keep it for consistency.

        if (changeType) {
          const isNew = changeType === "new";
          const badgeRadius = Math.max(16, radius * 0.42);
          const badgeX = radius * 0.72;
          const badgeY = -radius * 0.72;

          const gradientColors = isNew
            ? { from: "#10B981", to: "#059669", glow: "rgba(16, 185, 129, 0.4)" }
            : { from: "#3B82F6", to: "#2563EB", glow: "rgba(59, 130, 246, 0.4)" };

          return (
            <g transform={`translate(${badgeX}, ${badgeY})`}>
              <circle
                r={badgeRadius + 6}
                fill="none"
                stroke={gradientColors.from}
                strokeWidth={2}
                opacity={0.4}
                style={{ animation: "badge-pulse 1.5s ease-in-out infinite" }}
              />
              <defs>
                <linearGradient id={`change-badge-gradient-${node.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={gradientColors.from} />
                  <stop offset="100%" stopColor={gradientColors.to} />
                </linearGradient>
              </defs>
              <circle r={badgeRadius} fill={`url(#change-badge-gradient-${node.id})`} />
              {isNew ? (
                <rect x={-badgeRadius / 2} y={-badgeRadius / 8} width={badgeRadius} height={badgeRadius / 4} fill="white" />
              ) : (
                <text fill="white" fontSize={badgeRadius} x={-badgeRadius / 3} y={badgeRadius / 3}>✓</text>
              )}
              <style>
                {`
                  @keyframes badge-pulse {
                    0%, 100% { transform: scale(1); opacity: 0.4; }
                    50% { transform: scale(1.3); opacity: 0; }
                  }
                `}
              </style>
            </g>
          );
        }

        if (
          node.status &&
          node.status !== "active" &&
          node.status !== "alive" &&
          node.status !== "생존"
        ) {
          const statusConfig = STATUS_CONFIG[node.status] || STATUS_CONFIG.unknown;
          const badgeRadius = Math.max(13, radius * 0.35);
          const badgeX = radius * 0.65;
          const badgeY = radius * 0.65;

          return (
            <g transform={`translate(${badgeX}, ${badgeY})`}>
              <circle
                r={badgeRadius + 2}
                fill="white"
                stroke={statusConfig.color}
                strokeWidth={1.5}
                style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.15))" }}
              />
              <circle r={badgeRadius} fill={statusConfig.color} />
              <text
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={badgeRadius * 1.1 + 3}
                fill="white"
                style={{ userSelect: "none" }}
              >
                {statusConfig.icon}
              </text>
            </g>
          );
        }

        if (showLogicCheck && node.status === "contradictory") {
          const badgeRadius = Math.max(13, radius * 0.35);
          const badgeX = -radius * 0.65;
          const badgeY = -radius * 0.65;
          return (
            <g transform={`translate(${badgeX}, ${badgeY})`}>
              <circle r={badgeRadius} fill="#C49545" />
              <text textAnchor="middle" dominantBaseline="central" fill="white">⚠️</text>
            </g>
          )
        }
        return null;
      })()}

      {/* 이름 라벨 - Minimalist Serif style */}
      {showLabel && (
        <g
          transform={`translate(0, ${radius + (isImportant ? 20 : 12)})`}
          style={{
            opacity: labelOpacity,
            transition: "opacity 200ms ease-out",
          }}
        >
          <text
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={Math.max(16, radius * 0.38 + 4)}
            fontWeight={isImportant ? 700 : 500}
            fontFamily="'DM Serif Display', serif"
            fill="#3D302A"
            style={{
              userSelect: "none",
              textShadow:
                "0 1px 4px rgba(255,255,255,0.8), 0 0 2px rgba(255,255,255,0.4)",
            }}
          >
            {displayName}
          </text>
        </g>
      )}

      {/* Full name tooltip */}
      {displayName !== node.name && <title>{node.name}</title>}

      {/* Pin Tooltip Guide */}
      {isHovered && node.fx !== undefined && (
        <g transform={`translate(0, ${radius + (isImportant ? 45 : 35)})`}>
          <rect
            x="-45"
            y="-10"
            width="90"
            height="20"
            rx="10"
            fill="#3D302A"
            opacity="0.8"
          />
          <text
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="10"
            fontWeight="700"
            fill="white"
            style={{ userSelect: "none" }}
          >
            더블 클릭 시 고정 해제
          </text>
        </g>
      )}
    </g>
  );
});
