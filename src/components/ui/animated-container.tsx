/**
 * AnimatedContainer 컴포넌트
 * framer-motion 기반 애니메이션 래퍼
 *
 * - 페이지 전환 애니메이션
 * - Staggered reveal 애니메이션
 * - 스크롤 기반 뷰포트 진입 애니메이션
 */
import * as React from "react";
import {
  motion,
  AnimatePresence,
  type Variants,
  type HTMLMotionProps,
} from "framer-motion";
import { cn } from "@/lib/utils";

// Organic easing 커브 (Warm & Soft)
const organicEase = [0.19, 1, 0.22, 1];

// 미리 정의된 애니메이션 variants
const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: organicEase },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: { duration: 0.3, ease: organicEase },
  },
};

const fadeInVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.4, ease: organicEase },
  },
  exit: { opacity: 0, transition: { duration: 0.3, ease: organicEase } },
};

const scaleInVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: organicEase },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.3, ease: organicEase },
  },
};

const slideUpVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: organicEase },
  },
  exit: {
    opacity: 0,
    y: -30,
    transition: { duration: 0.3, ease: organicEase },
  },
};

// Staggered children variants
const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

const staggerItemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: organicEase },
  },
};

// 애니메이션 타입 맵
const animationVariantsMap = {
  fadeUp: fadeUpVariants,
  fadeIn: fadeInVariants,
  scaleIn: scaleInVariants,
  slideUp: slideUpVariants,
  stagger: staggerContainerVariants,
};

export type AnimationType = keyof typeof animationVariantsMap;

interface AnimatedContainerProps
  extends Omit<HTMLMotionProps<"div">, "children"> {
  animation?: AnimationType;
  delay?: number;
  duration?: number;
  once?: boolean; // viewport 진입 시 한 번만 애니메이션
  amount?: number; // viewport 진입 비율 (0-1)
  children: React.ReactNode;
}

export const AnimatedContainer = React.forwardRef<
  HTMLDivElement,
  AnimatedContainerProps
>(
  (
    {
      animation = "fadeUp",
      delay = 0,
      duration,
      once = true,
      amount = 0.2,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const variants = animationVariantsMap[animation];
    const customTransition = {
      delay,
      ...(duration && { duration }),
    };

    return (
      <motion.div
        ref={ref}
        initial="hidden"
        whileInView="visible"
        viewport={{ once, amount }}
        variants={variants}
        transition={customTransition}
        className={className}
        {...props}
      >
        {children}
      </motion.div>
    );
  },
);

AnimatedContainer.displayName = "AnimatedContainer";

// Staggered Children 래퍼
interface StaggerContainerProps
  extends Omit<HTMLMotionProps<"div">, "children"> {
  staggerDelay?: number;
  delayChildren?: number;
  once?: boolean;
  amount?: number;
  children: React.ReactNode;
}

export const StaggerContainer = React.forwardRef<
  HTMLDivElement,
  StaggerContainerProps
>(
  (
    {
      staggerDelay = 0.05,
      delayChildren = 0.1,
      once = true,
      amount = 0.2,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const containerVariants: Variants = {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: staggerDelay,
          delayChildren,
        },
      },
    };

    return (
      <motion.div
        ref={ref}
        initial="hidden"
        whileInView="visible"
        viewport={{ once, amount }}
        variants={containerVariants}
        className={className}
        {...props}
      >
        {children}
      </motion.div>
    );
  },
);

StaggerContainer.displayName = "StaggerContainer";

// Staggered Item
interface StaggerItemProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children: React.ReactNode;
}

export const StaggerItem = React.forwardRef<HTMLDivElement, StaggerItemProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        variants={staggerItemVariants}
        className={className}
        {...props}
      >
        {children}
      </motion.div>
    );
  },
);

StaggerItem.displayName = "StaggerItem";

// 페이지 전환 래퍼
interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export function PageTransition({ children, className }: PageTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: organicEase }}
      className={cn("w-full", className)}
    >
      {children}
    </motion.div>
  );
}

// AnimatePresence 래퍼 (페이지 전환에 사용)
interface AnimatedPresenceWrapperProps {
  children: React.ReactNode;
  mode?: "wait" | "sync" | "popLayout";
}

export function AnimatedPresenceWrapper({
  children,
  mode = "wait",
}: AnimatedPresenceWrapperProps) {
  return <AnimatePresence mode={mode}>{children}</AnimatePresence>;
}

// Layout 애니메이션 (Bento Grid용)
interface LayoutAnimationProps
  extends Omit<HTMLMotionProps<"div">, "children"> {
  layoutId?: string;
  children: React.ReactNode;
}

export const LayoutAnimation = React.forwardRef<
  HTMLDivElement,
  LayoutAnimationProps
>(({ layoutId, className, children, ...props }, ref) => {
  return (
    <motion.div
      ref={ref}
      layout
      layoutId={layoutId}
      transition={{
        layout: {
          type: "spring",
          stiffness: 300,
          damping: 30,
        },
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
});

LayoutAnimation.displayName = "LayoutAnimation";

/* eslint-disable react-refresh/only-export-components */
export {
  fadeUpVariants,
  fadeInVariants,
  scaleInVariants,
  slideUpVariants,
  staggerContainerVariants,
  staggerItemVariants,
  organicEase,
};
