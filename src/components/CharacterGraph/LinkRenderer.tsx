import { memo, useMemo } from "react";
import type { RelationshipLink, UIRelationType } from "@/types";
import {
  RELATION_PALETTE,
  MIN_CURVE_DISTANCE_SQ,
  MAX_CURVE_OFFSET,
  CURVE_FACTOR,
} from "./constants";
import { getRelationshipColor } from "./utils";

interface LinkRendererProps {
  link: RelationshipLink;
  isHighlighted: boolean;
  isDimmed: boolean;
  isFiltered: boolean;
  onClick: (link: RelationshipLink) => void;
  onHover: (linkId: string | null) => void;
  changeType?: "new" | "updated" | "collapse" | null;
}

/**
 * SVG 엣지(Link) 렌더러 - Enhanced with Complex Curves & Flow
 * - 2차 베지에 곡선 (Quadratic Bezier) 적용
 * - Animated Flow Gradients for Directionality
 * - Tension/Conflict indicators
 */
export const LinkRenderer = memo(function LinkRenderer({
  link,
  isHighlighted,
  isDimmed,
  isFiltered,
  onClick,
  onHover,
  changeType,
}: LinkRendererProps) {
  // Safe Accessors for D3 Node Objects
  const source = typeof link.source === "object" ? link.source : null;
  const target = typeof link.target === "object" ? link.target : null;

  // Memoized ID for gradient/filter uniqueness
  const gradientId = useMemo(
    () => `link-grad-${link.id || Math.random().toString(36).substr(2, 9)}`,
    [link.id],
  );

  const glowFilterId = useMemo(
    () => `glow-${link.id || Math.random().toString(36).substr(2, 9)}`,
    [link.id],
  );

  if (
    !source ||
    !target ||
    source.x === undefined ||
    source.y === undefined ||
    target.x === undefined ||
    target.y === undefined
  ) {
    return null;
  }

  // --- 1. Curve Calculation (Cubic Bezier for Smoother S-Curves) ---
  const dx = target.x - source.x;
  const dy = target.y - source.y;
  const distSq = dx * dx + dy * dy;

  const isCurved = distSq > MIN_CURVE_DISTANCE_SQ;
  let pathD = "";

  if (isCurved) {
    // Cubic Bezier calculation
    const dist = Math.sqrt(distSq);

    const ux = dx / dist;
    const uy = dy / dist;

    const curveDirection =
      source.index !== undefined && target.index !== undefined
        ? source.index < target.index
          ? 1
          : -1
        : 1;

    let offset = Math.min(dist * CURVE_FACTOR, MAX_CURVE_OFFSET);
    if (link.bidirectional) offset *= 1.5;

    // Symmetric Cubic Bezier for smoother S-shape if needed, but here we use it for a smoother arc
    const cp1X = source.x + dx * 0.25 - uy * offset * curveDirection;
    const cp1Y = source.y + dy * 0.25 + ux * offset * curveDirection;
    const cp2X = source.x + dx * 0.75 - uy * offset * curveDirection;
    const cp2Y = source.y + dy * 0.75 + ux * offset * curveDirection;

    pathD = `M${source.x},${source.y} C${cp1X},${cp1Y} ${cp2X},${cp2Y} ${target.x},${target.y}`;
  } else {
    pathD = `M${source.x},${source.y} L${target.x},${target.y}`;
  }

  // --- 2. Color & Style Logic ---
  const primaryColor = useMemo(() => {
    if (changeType === "new") return "#10B981"; // Green
    if (changeType === "updated") return "#3B82F6"; // Blue
    if (changeType === "collapse") return "#F59E0B"; // Amber for collapse path

    return getRelationshipColor(
      link.type as UIRelationType,
      link.strength,
      link.relationTypes as string[],
    );
  }, [link.type, link.strength, link.relationTypes, changeType]);

  const secondaryColor = useMemo(() => {
    // Gradient end color (slightly lighter or related hue)
    if (changeType) return "#FFF";
    const palette = RELATION_PALETTE[link.type as UIRelationType] || RELATION_PALETTE.neutral;
    return palette.weak;
  }, [link.type, changeType]);

  // Interaction State
  const isHovered = false; // We use onHover prop typically, but local state if needed. React handles hover via parent.
  // Actually, parent handles hover logic, this component just receives props.

  // Strength-based Width
  const baseWidth = Math.max(1.5, Math.min(link.strength * 0.6, 5));
  const activeBonus = isHighlighted || isHovered ? 2 : 0;
  const strokeWidth = baseWidth + activeBonus;

  // Opacity Logic
  const opacity = (() => {
    if (changeType === "collapse") return 0.3;
    if (isFiltered) return 0.02; // Ghostly visible
    if (isDimmed) return 0.08;
    if (isHighlighted) return 0.95;
    return 0.4 + (link.strength / 10) * 0.2; // Base opacity 0.4 ~ 0.6
  })();

  const isActive = isHighlighted || changeType === "new";
  const showFlow = isActive || changeType !== null;

  // Optimized Flow Animation (Electric Feel)
  const flowDuration = 3 - (link.strength / 10) * 1.5;
  const flowDelay = link.flowDepth !== undefined && link.flowDepth >= 0
    ? link.flowDepth * 0.2
    : Math.random() * 2;

  // Transition Styles
  const transitionStyle = {
    transitionProperty: "stroke, stroke-width, stroke-opacity, filter",
    transitionDuration: "300ms",
    transitionTimingFunction: "ease-out",
  };

  return (
    <g
      className="link-group"
      style={{ cursor: "pointer" }}
      onClick={(e) => {
        e.stopPropagation();
        onClick(link);
      }}
      onMouseEnter={() => {
        if (onHover) onHover(link.id);
      }}
      onMouseLeave={() => {
        if (onHover) onHover(null);
      }}
    >
      <defs>
        <linearGradient id={gradientId} gradientUnits="userSpaceOnUse" x1={source.x} y1={source.y} x2={target.x} y2={target.y}>
          <stop offset="0%" stopColor={secondaryColor} stopOpacity="0">
            <animate attributeName="offset" values="-1; 1" dur={`${flowDuration}s`} begin={`${flowDelay}s`} repeatCount="indefinite" />
          </stop>
          <stop offset="25%" stopColor={secondaryColor} stopOpacity={isActive ? 1 : 0.9}>
            <animate attributeName="offset" values="-0.75; 1.25" dur={`${flowDuration}s`} begin={`${flowDelay}s`} repeatCount="indefinite" />
          </stop>
          <stop offset="50%" stopColor={primaryColor} stopOpacity="0">
            <animate attributeName="offset" values="-0.5; 1.5" dur={`${flowDuration}s`} begin={`${flowDelay}s`} repeatCount="indefinite" />
          </stop>
        </linearGradient>

        <filter id={glowFilterId} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation={isActive ? 3 : 1} result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* 1. Hitbox (Invisible wide stroke for easier selection) */}
      <path
        d={pathD}
        fill="none"
        stroke="transparent"
        strokeWidth={Math.max(12, strokeWidth * 3)}
        style={{ pointerEvents: "stroke" }}
      />

      {/* 2. Base Line */}
      <path
        d={pathD}
        fill="none"
        stroke={primaryColor}
        strokeWidth={strokeWidth}
        strokeOpacity={opacity}
        strokeLinecap="round"
        filter={isActive ? `url(#${glowFilterId})` : undefined}
        style={transitionStyle}
      />

      {/* 3. Flow Animation Overlay - Enhanced for Premium Feel */}
      {showFlow && !link.bidirectional && (
        <path
          d={pathD}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth + (isActive ? 3 : 1.5)}
          strokeOpacity={isActive ? 1 : 0.8}
          strokeLinecap="round"
          style={{
            mixBlendMode: "plus-lighter",
            pointerEvents: "none"
          }}
        />
      )}

      {/* 3b. Glow Path (Secondary Layer) */}
      {isActive && (
        <path
          d={pathD}
          fill="none"
          stroke={primaryColor}
          strokeWidth={strokeWidth + 4}
          strokeOpacity={0.15}
          strokeLinecap="round"
          filter={`blur(4px)`}
          style={{ pointerEvents: "none" }}
        />
      )}
    </g>
  );
});
