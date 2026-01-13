// =====================================================
// 📈 Relationship Timeline Graph Component
// D3.js 기반 Narrative Bond 타임라인 그래프
// =====================================================

import { useMemo, useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import * as d3 from "d3";
import { cn } from "@/lib/utils";

/** 타임라인 포인트 인터페이스 */
export interface RelationshipTimelinePoint {
  eventId: string;
  chapter: number;
  title: string;
  description: string;
  sentimentTrajectory: number; // -100 ~ 100
  importance: number; // 1 ~ 10
  emotionalPolarity: number; // -10 ~ 10
}

interface RelationshipTimelineGraphProps {
  /** 타임라인 데이터 */
  data: RelationshipTimelinePoint[];
  /** 높이 */
  height?: number;
  /** 애니메이션 딜레이 (초) */
  animationDelay?: number;
  /** 추가 클래스 */
  className?: string;
}

const FRIENDLY_COLOR = "#0D9488"; // Teal-600
const HOSTILE_COLOR = "#E11D48"; // Rose-600

export function RelationshipTimelineGraph({
  data,
  height = 180,
  animationDelay = 0,
  className,
}: RelationshipTimelineGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [isAnimated, setIsAnimated] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setWidth(entry.contentRect.width);
      }
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  const margin = { top: 20, right: 20, bottom: 30, left: 40 };
  const innerWidth = Math.max(0, width - margin.left - margin.right);
  const innerHeight = Math.max(0, height - margin.top - margin.bottom);

  const scales = useMemo(() => {
    if (data.length === 0 || innerWidth <= 0) return null;

    const x = d3.scaleLinear()
      .domain([0, data.length - 1])
      .range([0, innerWidth]);

    const y = d3.scaleLinear()
      .domain([-105, 105])
      .range([innerHeight, 0]);

    return { x, y };
  }, [data.length, innerWidth, innerHeight]);

  const pathData = useMemo(() => {
    if (!scales) return "";
    const lineGenerator = d3.line<{ val: number; idx: number }>()
      .x((d) => scales.x(d.idx))
      .y((d) => scales.y(d.val))
      .curve(d3.curveCatmullRom.alpha(0.5));

    const points = data.map((d, i) => ({
      val: d.sentimentTrajectory,
      idx: i,
    }));
    return lineGenerator(points) ?? "";
  }, [scales, data]);

  useEffect(() => {
    const timer = setTimeout(() => setIsAnimated(true), animationDelay * 1000);
    return () => clearTimeout(timer);
  }, [animationDelay]);

  if (data.length === 0) return null;

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      {width > 0 && scales && (
        <svg width={width} height={height} className="overflow-visible">
          <defs>
            <linearGradient id="sentiment-grad" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor={HOSTILE_COLOR} />
              <stop offset="45%" stopColor={HOSTILE_COLOR} />
              <stop offset="50%" stopColor="#94a3b8" />
              <stop offset="55%" stopColor={FRIENDLY_COLOR} />
              <stop offset="100%" stopColor={FRIENDLY_COLOR} />
            </linearGradient>
          </defs>

          <g transform={`translate(${margin.left}, ${margin.top})`}>
            {/* Grid */}
            {[-100, 0, 100].map((tick) => (
              <g key={tick} transform={`translate(0, ${scales.y(tick)})`}>
                <line x1={0} x2={innerWidth} stroke="rgba(164, 119, 100, 0.1)" strokeDasharray={tick === 0 ? "" : "4 4"} />
                <text x={-8} y={0} textAnchor="end" dominantBaseline="middle" className="text-[9px] fill-espresso-400 font-spectral">
                  {tick > 0 ? `+${tick}` : tick}
                </text>
              </g>
            ))}

            {/* Path */}
            <motion.path
              d={pathData}
              fill="none"
              stroke="url(#sentiment-grad)"
              strokeWidth={3}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={isAnimated ? { pathLength: 1, opacity: 1 } : {}}
              transition={{ duration: 1.5, ease: "easeInOut" }}
            />

            {/* Points */}
            {data.map((d, i) => (
              <motion.circle
                key={d.eventId}
                cx={scales.x(i)}
                cy={scales.y(d.sentimentTrajectory)}
                r={3.5}
                fill={d.sentimentTrajectory > 0 ? FRIENDLY_COLOR : HOSTILE_COLOR}
                stroke="white"
                strokeWidth={1.5}
                initial={{ scale: 0 }}
                animate={isAnimated ? { scale: 1 } : {}}
                transition={{ delay: 0.3 + i * 0.1 }}
              />
            ))}
          </g>
        </svg>
      )}
    </div>
  );
}

export default RelationshipTimelineGraph;
