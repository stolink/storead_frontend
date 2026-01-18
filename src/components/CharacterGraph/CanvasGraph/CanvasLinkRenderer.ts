import type { CharacterNode } from "@/types";
import type { LinkRenderOptions } from "./types";
import { getRelationshipColor, type UIRelationType } from "../utils";
import tinycolor from "tinycolor2";

/**
 * Canvas에 링크를 렌더링하는 함수
 * LinkRenderer.tsx의 7계층 렌더링 로직을 Canvas API로 구현
 */
export function drawLink(options: LinkRenderOptions): void {
  const { ctx, link, state, animationPhase, changeType } = options;

  const source = link.source as CharacterNode;
  const target = link.target as CharacterNode;

  // Extract coordinates to avoid reference issues
  const sx = source.x;
  const sy = source.y;
  const tx = target.x;
  const ty = target.y;

  if (
    sx === undefined ||
    sy === undefined ||
    tx === undefined ||
    ty === undefined
  ) {
    return;
  }

  const { isHighlighted, isDimmed } = state;

  // Bezier 제어점 계산 (Universal Curvature)
  const curvature = link.curvature || 0;
  const midX = (sx + tx) / 2;
  const midY = (sy + ty) / 2;
  const dx = tx - sx;
  const dy = ty - sy;
  const controlX = midX - dy * curvature;
  const controlY = midY + dx * curvature;

  // 색상 로직
  const primaryColor = (() => {
    if (changeType === "inversion") return "#EF4444";
    if (changeType === "collapse") return "#9CA3AF";
    if (changeType === "new") return "#EAB308";
    if (changeType === "conflict") return "#C49545";
    if (changeType === "updated") return "#3B82F6";
    return getRelationshipColor(link.type as UIRelationType, link.strength);
  })();

  // 밝은 색 (흐름 애니메이션용)
  const secondaryColor = lightenColor(primaryColor, 120);

  // 점선 패턴
  const dashArray: number[] = (() => {
    if (changeType === "collapse") return [4, 6];
    if (changeType === "new") return [];
    if (link.type === "enemy" || link.type === "rival" || link.type === "betrayed") {
      return [6 + link.strength, 4 + (10 - link.strength) / 2];
    }
    return [];
  })();

  // 강도 기반 선 굵기
  const baseWidth = 1 + ((link.strength - 1) / 9) * 4;
  const activeBonus = isHighlighted ? 1.5 : 0;
  const strokeWidth = baseWidth + activeBonus;

  // 투명도
  const opacity = (() => {
    if (changeType === "collapse") return 0.3;
    if (isDimmed) return 0.08;
    if (isHighlighted) return 0.95;
    return 0.4 + (link.strength / 10) * 0.2;
  })();

  const isActive = isHighlighted && !isDimmed;
  const showFlow = changeType !== "collapse";

  // === Layer 2: 깊은 그림자 (입체감) ===
  ctx.save();
  ctx.strokeStyle = "rgba(0,0,0,0.2)";
  ctx.lineWidth = strokeWidth + 3;
  ctx.globalAlpha = opacity * 0.4;
  ctx.lineCap = "round";
  ctx.setLineDash(dashArray);
  ctx.beginPath();
  ctx.moveTo(sx + 1, sy + 2);
  ctx.quadraticCurveTo(controlX + 1, controlY + 2, tx + 1, ty + 2);
  ctx.stroke();
  ctx.restore();

  // === Layer 3: 부드러운 외부 글로우 (활성 상태에서만 shadowBlur 사용 - 성능 최적화) ===
  if (!isDimmed && changeType !== "collapse" && isActive) {
    ctx.save();
    ctx.strokeStyle = primaryColor;
    ctx.lineWidth = strokeWidth + 6;
    ctx.globalAlpha = 0.25;
    ctx.lineCap = "round";
    ctx.shadowColor = primaryColor;
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.quadraticCurveTo(controlX, controlY, tx, ty);
    ctx.stroke();
    ctx.restore();
  }

  // === Layer 4: Base Line (Solid or Pattern) ===
  const visualPattern = (link as any).visualPattern;
  const relationTypes = (link as any).relationTypes;

  if (
    visualPattern === "braided" &&
    relationTypes &&
    relationTypes.length > 0
  ) {
    // === Premium Braided (Intertwined Energy) Pattern for Mixed Types ===
    const steps = 40; // Higher resolution for smooth curves

    // Get unique colors for the strands
    const colors = relationTypes.map((t: any) =>
      getRelationshipColor(t as UIRelationType, 5),
    );

    // Core Rope Glow (Deep under-glow)
    ctx.save();
    ctx.strokeStyle = primaryColor;
    ctx.lineWidth = strokeWidth + 2;
    ctx.globalAlpha = isDimmed ? 0.05 : 0.2;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.quadraticCurveTo(controlX, controlY, tx, ty);
    ctx.stroke();
    ctx.restore();

    for (let i = 0; i < steps; i++) {
      const t1 = i / steps;
      const t2 = (i + 1) / steps;

      const getPoint = (t: number) => {
        const x =
          (1 - t) * (1 - t) * sx + 2 * (1 - t) * t * controlX + t * t * tx;
        const y =
          (1 - t) * (1 - t) * sy + 2 * (1 - t) * t * controlY + t * t * ty;
        return { x, y };
      };

      const p1 = getPoint(t1);
      const p2 = getPoint(t2);

      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const len = Math.sqrt(dx * dx + dy * dy) || 1;
      const nx = -dy / len;
      const ny = dx / len;

      // Amplitude: Rope thickness that tapers at ends (Reduced for tighter look)
      const amplitude = strokeWidth * 0.8 * Math.sin(t1 * Math.PI);

      // Draw each strand
      const strandCount = Math.min(colors.length, 3);
      for (let idx = 0; idx < strandCount; idx++) {
        const color = colors[idx] || colors[0];
        // Offset phases to twist around each other
        const phaseOffset = (idx * (2 * Math.PI)) / strandCount;
        const frequency = 4 * Math.PI; // Reduced twists for cleaner look

        const offset1 = Math.sin(t1 * frequency + phaseOffset) * amplitude;
        const offset2 = Math.sin(t2 * frequency + phaseOffset) * amplitude;

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(p1.x + nx * offset1, p1.y + ny * offset1);
        ctx.lineTo(p2.x + nx * offset2, p2.y + ny * offset2);

        ctx.strokeStyle = color;
        ctx.lineWidth = 1.2 + (isActive ? 0.8 : 0);

        // Strands near the center of the rope look brighter
        const zIndex = Math.cos(t1 * frequency + phaseOffset);
        ctx.globalAlpha = (isDimmed ? 0.1 : 0.4) + (zIndex > 0 ? 0.3 : 0);

        ctx.stroke();
        ctx.restore();
      }
    }

    // Top Highlight (Glass effect for the whole rope)
    ctx.save();
    ctx.strokeStyle = "rgba(255,255,255,0.4)";
    ctx.lineWidth = 0.8;
    ctx.globalAlpha = isActive ? 0.5 : 0.2;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.quadraticCurveTo(controlX, controlY, tx, ty);
    ctx.stroke();
    ctx.restore();
  } else if (visualPattern === "parallel") {
    // === Multi-Core Cable Pattern (Simplified for single consolidated look) ===
    // Thick line with internal core to suggest multiple links

    // 1. Broad Outer Glow
    ctx.save();
    ctx.strokeStyle = primaryColor;
    ctx.lineWidth = strokeWidth + 2;
    ctx.globalAlpha = isDimmed ? 0.05 : 0.15;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.quadraticCurveTo(controlX, controlY, tx, ty);
    ctx.stroke();
    ctx.restore();

    // 2. Thick Base
    ctx.save();
    ctx.strokeStyle = primaryColor;
    ctx.lineWidth = strokeWidth + 1;
    ctx.globalAlpha = isDimmed ? 0.1 : 0.5;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.quadraticCurveTo(controlX, controlY, tx, ty);
    ctx.stroke();
    ctx.restore();

    // 3. Central Highlight Core (Gives "cable bundle" feel without separate lines)
    ctx.save();
    ctx.strokeStyle = lightenColor(primaryColor, 60);
    ctx.lineWidth = strokeWidth * 0.4;
    ctx.globalAlpha = isDimmed ? 0.1 : 0.4;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.quadraticCurveTo(controlX, controlY, tx, ty);
    ctx.stroke();
    ctx.restore();
  } else {
    // === Standard Single Line ===
    ctx.save();
    ctx.strokeStyle = primaryColor;
    ctx.lineWidth = strokeWidth;
    ctx.globalAlpha = isDimmed ? 0.1 : 0.6;
    ctx.lineCap = "round";
    ctx.setLineDash(dashArray);
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.quadraticCurveTo(controlX, controlY, tx, ty);
    ctx.stroke();
    ctx.restore();
  }

  // === Layer 5: Flow Overlay (Directionality) ===
  // Enable flow for everyone except dim/hidden
  if (showFlow && !isDimmed) {
    ctx.save();

    // [STOLINK PARITY] Staggered Flow Animation
    // flowDepth * 0.2s delay logic
    const flowDelay =
      (link as any).flowDepth !== undefined ? (link as any).flowDepth * 0.2 : 0;
    // const flowDuration = 1.0; // 1s cycle
    const adjustedPhase = (animationPhase + 10 - (flowDelay % 1.0)) % 1.0;

    const gradient = ctx.createLinearGradient(sx, sy, tx, ty);
    const pos = adjustedPhase; // 0 to 1

    if ((link as any).bidirectional) {
      // === Bidirectional Flow: Pulse Outward from Center ===
      const p1 = 0.5 + pos * 0.5;
      const p2 = 0.5 - pos * 0.5;

      gradient.addColorStop(0, "transparent");
      gradient.addColorStop(Math.max(0, p2 - 0.1), "transparent");
      gradient.addColorStop(p2, secondaryColor);
      gradient.addColorStop(Math.min(0.5, p2 + 0.1), "transparent");
      gradient.addColorStop(0.5, "transparent");
      gradient.addColorStop(Math.max(0.5, p1 - 0.1), "transparent");
      gradient.addColorStop(p1, secondaryColor);
      gradient.addColorStop(Math.min(1, p1 + 0.1), "transparent");
      gradient.addColorStop(1, "transparent");
    } else {
      // === Unidirectional Flow: Source -> Target ===
      gradient.addColorStop(Math.max(0, pos - 0.25), "transparent");
      gradient.addColorStop(pos, secondaryColor);
      gradient.addColorStop(Math.min(1, pos + 0.25), "transparent");
    }

    ctx.strokeStyle = gradient;
    ctx.lineWidth = strokeWidth + (isActive ? 2 : 1);
    ctx.globalAlpha = isActive ? 1 : 0.8; // 연하게 조정
    ctx.lineCap = "round";
    ctx.setLineDash(dashArray);
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.quadraticCurveTo(controlX, controlY, tx, ty);
    ctx.stroke();
    ctx.restore();
  }

  // === Layer 5.5: Directional Arrows ===
  // Add arrows to indicate direction clearly, especially for thick cables
  if (changeType !== "collapse") {
    const arrowSize = 6 + strokeWidth / 2; // Dynamic size

    // Simplified Arrow Placement: Center of the path
    // Calculating curve length intersection is expensive.
    // Let's place small chevron text/shape at 2/3 distance?
    // Or just draw a triangle at the "Center" of the curve pointing to Target?

    // Unidirectional: Arrow at 60%
    // Bidirectional: Arrows at 30% (<) and 70% (>)// _t_arrow1 and _t_arrow2 removed as they were unused // For bidirectional second arrow

    const drawChevron = (t: number, isReverse: boolean) => {
      const mt = 1 - t;
      const x = mt * mt * sx + 2 * mt * t * controlX + t * t * tx;
      const y = mt * mt * sy + 2 * mt * t * controlY + t * t * ty;

      // Tangent
      const tangentX = 2 * mt * (controlX - sx) + 2 * t * (tx - controlX);
      const tangentY = 2 * mt * (controlY - sy) + 2 * t * (ty - controlY);
      const angle = Math.atan2(tangentY, tangentX) + (isReverse ? Math.PI : 0);

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.fillStyle = primaryColor;
      ctx.globalAlpha = 0.8;
      ctx.beginPath();
      ctx.moveTo(-arrowSize, -arrowSize / 2);
      ctx.lineTo(0, 0);
      ctx.lineTo(-arrowSize, arrowSize / 2);
      ctx.stroke(); // Chevron style ( > )
      ctx.strokeStyle = primaryColor;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    };

    // Draw
    if (!(link as any).bidirectional) {
      // Unidirectional: Just one at 60% pointing to Target
      drawChevron(0.6, false);
    }
  }

  // === Layer 6: 하이라이트 (상단 빛 반사) ===
  if (changeType !== "collapse" && visualPattern !== "braided") {
    ctx.save();
    ctx.strokeStyle = "rgba(255,255,255,0.4)";
    ctx.lineWidth = Math.max(0.8, strokeWidth * 0.3);
    ctx.globalAlpha = isDimmed ? 0.05 : isActive ? 0.5 : 0.2;
    ctx.lineCap = "round";
    ctx.setLineDash(dashArray);
    ctx.beginPath();
    ctx.moveTo(sx - 0.3, sy - 0.8);
    ctx.quadraticCurveTo(controlX - 0.3, controlY - 0.8, tx - 0.3, ty - 0.8);
    ctx.stroke();
    ctx.restore();
  }

  // Reset
  ctx.setLineDash([]);
  ctx.globalAlpha = 1;
}

/**
 * 색상을 밝게 만드는 헬퍼 함수 (tinycolor2 사용)
 * 3자리 Hex, 잘못된 입력값에도 안전하게 동작합니다.
 */
function lightenColor(color: string, amount: number): string {
  const tc = tinycolor(color);
  if (!tc.isValid()) {
    return `rgb(255, 255, 255)`; // 유효하지 않은 색상은 흰색 반환
  }
  // tinycolor의 lighten은 %, 기존 로직은 0-255 범위.
  // amount / 255 * 100으로 변환하여 유사한 효과 적용
  return tc.lighten((amount / 255) * 100).toRgbString();
}
