// =====================================================
// 📊 Relationship Radar Chart Component
// D3.js 기반 5축 레이더 차트 with Framer Motion 애니메이션
// =====================================================

import { useMemo, useId } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/** 관계 속성 인터페이스 */
export interface RelationshipAttributes {
    emotionalBond: number;  // 정서적 유대
    functionalTrust: number; // 기능적 신뢰
    valueAlignment: number; // 가치관 일치
    interdependence: number; // 상호 의존성
    latentTension: number;   // 잠재적 긴장
}

export interface RadarAxisConfig {
    key: keyof RelationshipAttributes;
    label: string;
}

interface RelationshipRadarChartProps {
    /** 관계 속성 데이터 */
    attributes: RelationshipAttributes;
    /** 차트 크기 (정사각형, 기본 200) */
    size?: number;
    /** 차트 색상 (teal, rose, mocha) */
    color?: "teal" | "rose" | "mocha";
    /** 애니메이션 딜레이 (초) */
    animationDelay?: number;
    /** 레이블 표시 여부 */
    showLabels?: boolean;
    /** 축 배열 (커스텀 가능) */
    axes?: RadarAxisConfig[];
    /** 추가 클래스 */
    className?: string;
}

// 기본 축 설정
const DEFAULT_AXES: RadarAxisConfig[] = [
    { key: "emotionalBond", label: "정서적 유대" },
    { key: "functionalTrust", label: "기능적 신뢰" },
    { key: "valueAlignment", label: "가치관 일치" },
    { key: "interdependence", label: "상호 의존성" },
    { key: "latentTension", label: "잠재적 긴장" },
];

// 색상 팔레트
const COLOR_PALETTE = {
    teal: {
        fill: "rgba(13, 148, 136, 0.2)",
        stroke: "#0D9488",
        glow: "#5EEAD4",
        point: "#0F766E",
    },
    rose: {
        fill: "rgba(225, 29, 72, 0.2)",
        stroke: "#E11D48",
        glow: "#FDA4AF",
        point: "#BE123C",
    },
    mocha: {
        fill: "rgba(164, 119, 100, 0.2)",
        stroke: "#A47764",
        glow: "#BD9B8D",
        point: "#7D5A4B",
    },
};

/** 극좌표를 직교좌표로 변환 */
function polarToCartesian(
    centerX: number,
    centerY: number,
    radius: number,
    angleInDegrees: number,
): { x: number; y: number } {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180;
    return {
        x: centerX + radius * Math.cos(angleInRadians),
        y: centerY + radius * Math.sin(angleInRadians),
    };
}

/** 폴리곤 포인트 문자열 생성 */
function generatePolygonPoints(
    values: number[],
    center: number,
    maxRadius: number,
    maxValue: number = 10,
): string {
    const angleStep = 360 / values.length;

    return values
        .map((value, i) => {
            const radius = (value / maxValue) * maxRadius;
            const point = polarToCartesian(center, center, radius, i * angleStep);
            return `${point.x},${point.y}`;
        })
        .join(" ");
}

export function RelationshipRadarChart({
    attributes,
    size = 200,
    color = "mocha",
    animationDelay = 0,
    showLabels = true,
    axes = DEFAULT_AXES,
    className,
}: RelationshipRadarChartProps) {
    const gradientId = useId();
    const glowId = useId();

    const center = size / 2;
    const maxRadius = size * 0.35;
    const labelRadius = size * 0.44;

    const colors = COLOR_PALETTE[color] || COLOR_PALETTE.mocha;
    const numAxes = axes.length;
    const angleStep = 360 / numAxes;

    const values = useMemo(
        () => axes.map((axis) => attributes?.[axis.key] ?? 0),
        [attributes, axes],
    );

    const centerPoints = useMemo(
        () => generatePolygonPoints(new Array(numAxes).fill(0), center, maxRadius),
        [numAxes, center, maxRadius],
    );

    const currentPoints = useMemo(
        () => generatePolygonPoints(values, center, maxRadius),
        [values, center, maxRadius],
    );

    const gridLevels = [2.5, 5, 7.5, 10];

    return (
        <div
            className={cn("relative flex items-center justify-center", className)}
            style={{ width: size, height: size }}
        >
            <svg
                width={size}
                height={size}
                viewBox={`0 0 ${size} ${size}`}
                className="overflow-visible"
            >
                <defs>
                    <radialGradient id={gradientId} cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor={colors.stroke} stopOpacity="0.4" />
                        <stop offset="100%" stopColor={colors.fill} stopOpacity="0.1" />
                    </radialGradient>

                    <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="2" result="blur" />
                        <feFlood floodColor={colors.glow} floodOpacity="0.3" />
                        <feComposite in2="blur" operator="in" />
                        <feMerge>
                            <feMergeNode />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Background Grid */}
                {gridLevels.map((level) => (
                    <polygon
                        key={level}
                        points={generatePolygonPoints(
                            new Array(numAxes).fill(level),
                            center,
                            maxRadius,
                        )}
                        fill="none"
                        stroke="rgba(164, 119, 100, 0.1)"
                        strokeWidth="1"
                    />
                ))}

                {/* Axis Lines */}
                {axes.map((_, i) => {
                    const endPoint = polarToCartesian(
                        center,
                        center,
                        maxRadius,
                        i * angleStep,
                    );
                    return (
                        <line
                            key={i}
                            x1={center}
                            y1={center}
                            x2={endPoint.x}
                            y2={endPoint.y}
                            stroke="rgba(164, 119, 100, 0.1)"
                            strokeWidth="1"
                        />
                    );
                })}

                {/* Data Polygon */}
                <motion.polygon
                    points={centerPoints}
                    fill={`url(#${gradientId})`}
                    stroke={colors.stroke}
                    strokeWidth="2"
                    filter={`url(#${glowId})`}
                    initial={{ points: centerPoints }}
                    animate={{ points: currentPoints }}
                    transition={{
                        duration: 0.8,
                        ease: "easeOut",
                        delay: animationDelay,
                    }}
                />

                {/* Data Points */}
                {values.map((value, i) => {
                    const radius = (value / 10) * maxRadius;
                    const point = polarToCartesian(center, center, radius, i * angleStep);

                    return (
                        <motion.circle
                            key={i}
                            cx={center}
                            cy={center}
                            r={3}
                            fill={colors.stroke}
                            stroke="white"
                            strokeWidth="1"
                            initial={{ cx: center, cy: center, opacity: 0 }}
                            animate={{ cx: point.x, cy: point.y, opacity: 1 }}
                            transition={{
                                duration: 0.8,
                                ease: "easeOut",
                                delay: animationDelay + 0.1,
                            }}
                        />
                    );
                })}

                {/* Labels */}
                {showLabels &&
                    axes.map((axis, i) => {
                        const point = polarToCartesian(
                            center,
                            center,
                            labelRadius,
                            i * angleStep,
                        );

                        const isLeft = point.x < center - 10;
                        const isRight = point.x > center + 10;
                        const textAnchor = isLeft ? "end" : isRight ? "start" : "middle";

                        return (
                            <text
                                key={axis.key}
                                x={point.x}
                                y={point.y}
                                textAnchor={textAnchor}
                                dominantBaseline="middle"
                                className="fill-espresso-900 text-[11px] font-bold font-spectral"
                            >
                                {axis.label}
                            </text>
                        );
                    })}
            </svg>
        </div>
    );
}

export default RelationshipRadarChart;
