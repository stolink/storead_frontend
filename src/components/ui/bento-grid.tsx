/**
 * BentoGrid 컴포넌트
 * Fluid Bento Grid 시스템 - 콘텐츠 우선순위에 따른 유동적 그리드
 *
 * Priority:
 * - hero: 2x2 또는 3x2 (메인 추천 작품)
 * - featured: 2x1 (인기/신작 하이라이트)
 * - standard: 1x1 (일반 카드)
 * - compact: 1x0.5 (미니 카드)
 */
import * as React from "react";
import { motion, LayoutGroup, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

// Organic easing
const organicEase = [0.19, 1, 0.22, 1];

export type BentoPriority = "hero" | "featured" | "standard" | "compact";

interface BentoGridProps extends Omit<HTMLMotionProps<"div">, "children"> {
  columns?: 2 | 3 | 4;
  gap?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

const gapClasses = {
  sm: "gap-3",
  md: "gap-4",
  lg: "gap-6",
};

const columnClasses = {
  2: "grid-cols-2",
  3: "md:grid-cols-3",
  4: "lg:grid-cols-4",
};

export const BentoGrid = React.forwardRef<HTMLDivElement, BentoGridProps>(
  ({ columns = 4, gap = "md", className, children, ...props }, ref) => {
    return (
      <LayoutGroup>
        <motion.div
          ref={ref}
          layout
          className={cn(
            "bento-grid",
            gapClasses[gap],
            columnClasses[columns],
            className,
          )}
          {...props}
        >
          {children}
        </motion.div>
      </LayoutGroup>
    );
  },
);

BentoGrid.displayName = "BentoGrid";

// BentoItem 컴포넌트
interface BentoItemProps extends Omit<HTMLMotionProps<"div">, "children"> {
  priority?: BentoPriority;
  span?: { cols?: number; rows?: number };
  expandable?: boolean;
  expanded?: boolean;
  onExpand?: () => void;
  layoutId?: string;
  children: React.ReactNode;
}

const priorityClasses: Record<BentoPriority, string> = {
  hero: "bento-hero",
  featured: "bento-featured",
  standard: "",
  compact: "",
};

export const BentoItem = React.forwardRef<HTMLDivElement, BentoItemProps>(
  (
    {
      priority = "standard",
      span,
      expandable = false,
      expanded = false,
      onExpand,
      layoutId,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    // Custom span 스타일
    const spanStyle: React.CSSProperties = {};
    if (span?.cols) {
      spanStyle.gridColumn = `span ${span.cols}`;
    }
    if (span?.rows) {
      spanStyle.gridRow = `span ${span.rows}`;
    }

    return (
      <motion.div
        ref={ref}
        layout
        layoutId={layoutId}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{
          opacity: 1,
          scale: expanded ? 1.02 : 1,
        }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{
          layout: {
            type: "spring",
            stiffness: 300,
            damping: 30,
          },
          opacity: { duration: 0.3, ease: organicEase },
          scale: { duration: 0.3, ease: organicEase },
        }}
        whileHover={
          expandable
            ? { scale: 1.02, transition: { duration: 0.2 } }
            : undefined
        }
        onClick={expandable ? onExpand : undefined}
        className={cn(
          "bento-item",
          priorityClasses[priority],
          expandable && "cursor-pointer",
          className,
        )}
        style={spanStyle}
        {...props}
      >
        {children}
      </motion.div>
    );
  },
);

BentoItem.displayName = "BentoItem";

// BentoCard - 글래스모피즘이 적용된 Bento 아이템
interface BentoCardProps extends Omit<BentoItemProps, "children"> {
  title?: string;
  description?: string;
  image?: string;
  badge?: React.ReactNode;
  footer?: React.ReactNode;
  children?: React.ReactNode;
}

export const BentoCard = React.forwardRef<HTMLDivElement, BentoCardProps>(
  (
    {
      priority = "standard",
      title,
      description,
      image,
      badge,
      footer,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const isHero = priority === "hero";
    const isFeatured = priority === "featured";

    return (
      <BentoItem
        ref={ref}
        priority={priority}
        className={cn("glass-card overflow-hidden group", className)}
        {...props}
      >
        {/* 이미지 영역 */}
        {image && (
          <div
            className={cn(
              "relative overflow-hidden",
              isHero
                ? "aspect-[4/3]"
                : isFeatured
                  ? "aspect-[16/9]"
                  : "aspect-[3/4]",
            )}
          >
            <img
              src={image}
              alt={title || ""}
              className="w-full h-full object-cover transition-transform duration-500 ease-organic group-hover:scale-105"
            />
            {/* 그라데이션 오버레이 */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none" />

            {/* 배지 */}
            {badge && <div className="absolute top-3 left-3 z-10">{badge}</div>}

            {/* 텍스트 오버레이 (hero/featured에서만) */}
            {(isHero || isFeatured) && (title || description) && (
              <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
                {title && (
                  <h3
                    className={cn(
                      "font-bold text-white mb-1 line-clamp-2",
                      isHero ? "text-2xl" : "text-lg",
                    )}
                  >
                    {title}
                  </h3>
                )}
                {description && (
                  <p className="text-white/80 text-sm line-clamp-2">
                    {description}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* 텍스트 영역 (standard/compact에서) */}
        {!isHero && !isFeatured && (title || description || children) && (
          <div className="p-4 relative z-10">
            {title && (
              <h3 className="font-medium text-espresso-900 mb-1 line-clamp-2 group-hover:text-mocha-600 transition-colors">
                {title}
              </h3>
            )}
            {description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {description}
              </p>
            )}
            {children}
          </div>
        )}

        {/* 푸터 영역 */}
        {footer && <div className="p-4 pt-0 relative z-10">{footer}</div>}

        {/* Spotlight 효과 */}
        <div className="spotlight-effect absolute inset-0 pointer-events-none" />
      </BentoItem>
    );
  },
);

BentoCard.displayName = "BentoCard";

// Expandable Bento Card (클릭 시 확장)
interface ExpandableBentoCardProps extends BentoCardProps {
  expandedContent?: React.ReactNode;
}

export function ExpandableBentoCard({
  expandedContent,
  ...props
}: ExpandableBentoCardProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);

  return (
    <BentoCard
      {...props}
      expandable
      expanded={isExpanded}
      onExpand={() => setIsExpanded(!isExpanded)}
    >
      {isExpanded && expandedContent && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3, ease: organicEase }}
          className="overflow-hidden"
        >
          {expandedContent}
        </motion.div>
      )}
    </BentoCard>
  );
}

export default BentoGrid;
