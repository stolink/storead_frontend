/**
 * GlassCard 컴포넌트
 * 글래스모피즘 효과가 적용된 카드 컴포넌트
 *
 * Variants:
 * - default: 기본 글래스 효과
 * - warm: Cloud Dancer 틴트 글래스
 * - elevated: 더 강한 그림자와 블러
 * - dark: 다크 모드용
 */
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const glassCardVariants = cva(
  "relative rounded-xl transition-all duration-300",
  {
    variants: {
      variant: {
        default: "glass-card",
        warm: "glass-warm rounded-xl",
        elevated: "glass-card-elevated",
        dark: "glass-dark",
      },
      hover: {
        none: "",
        lift: "hover-lift",
        glow: "hover-glow",
        scale: "hover:scale-[1.02]",
      },
      spotlight: {
        none: "",
        mocha: "spotlight-effect",
        sage: "spotlight-effect-sage",
      },
      grain: {
        none: "",
        subtle: "grain-overlay",
        strong: "grain-overlay grain-overlay-strong",
      },
    },
    defaultVariants: {
      variant: "default",
      hover: "none",
      spotlight: "none",
      grain: "none",
    },
  }
);

export interface GlassCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof glassCardVariants> {
  asChild?: boolean;
}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  (
    { className, variant, hover, spotlight, grain, children, ...props },
    ref
  ) => {
    const cardRef = React.useRef<HTMLDivElement>(null);

    // Spotlight 효과를 위한 마우스 추적
    const handleMouseMove = React.useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        if (spotlight === "none" || !cardRef.current) return;

        const rect = cardRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        cardRef.current.style.setProperty("--mouse-x", `${x}%`);
        cardRef.current.style.setProperty("--mouse-y", `${y}%`);
      },
      [spotlight]
    );

    return (
      <div
        ref={(node) => {
          // Forward both refs
          (cardRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
          if (typeof ref === "function") {
            ref(node);
          } else if (ref) {
            ref.current = node;
          }
        }}
        className={cn(
          glassCardVariants({ variant, hover, spotlight, grain }),
          className
        )}
        onMouseMove={handleMouseMove}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GlassCard.displayName = "GlassCard";

// GlassCard 내부 컨텐츠 래퍼 (z-index 관리)
const GlassCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("relative z-10", className)} {...props} />
));

GlassCardContent.displayName = "GlassCardContent";

// GlassCard 헤더
const GlassCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("relative z-10 p-6 pb-0", className)}
    {...props}
  />
));

GlassCardHeader.displayName = "GlassCardHeader";

// GlassCard 푸터
const GlassCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("relative z-10 p-6 pt-0", className)}
    {...props}
  />
));

GlassCardFooter.displayName = "GlassCardFooter";

export { GlassCard, GlassCardContent, GlassCardHeader, GlassCardFooter, glassCardVariants };
