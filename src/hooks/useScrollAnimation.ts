/**
 * useScrollAnimation 훅
 * IntersectionObserver 기반 뷰포트 진입 감지 및 스크롤 애니메이션
 */
import { useEffect, useRef, useState, useCallback } from "react";

interface UseScrollAnimationOptions {
  threshold?: number; // 요소가 뷰포트에 얼마나 들어와야 트리거할지 (0-1)
  rootMargin?: string; // 뷰포트 마진
  once?: boolean; // 한 번만 트리거할지
  delay?: number; // 애니메이션 시작 지연 (ms)
}

interface UseScrollAnimationReturn {
  ref: React.RefObject<HTMLDivElement | null>;
  isVisible: boolean;
  hasAnimated: boolean;
}

export function useScrollAnimation(
  options: UseScrollAnimationOptions = {}
): UseScrollAnimationReturn {
  const { threshold = 0.2, rootMargin = "0px", once = true, delay = 0 } = options;

  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (delay > 0) {
              setTimeout(() => {
                setIsVisible(true);
                setHasAnimated(true);
              }, delay);
            } else {
              setIsVisible(true);
              setHasAnimated(true);
            }

            if (once) {
              observer.unobserve(element);
            }
          } else if (!once) {
            setIsVisible(false);
          }
        });
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, once, delay]);

  return { ref, isVisible, hasAnimated };
}

// 다중 요소 스크롤 애니메이션 훅
interface UseMultiScrollAnimationOptions extends UseScrollAnimationOptions {
  staggerDelay?: number; // 각 요소 간 지연 시간 (ms)
}

export function useMultiScrollAnimation(
  count: number,
  options: UseMultiScrollAnimationOptions = {}
) {
  const { staggerDelay = 100, ...scrollOptions } = options;

  const refs = useRef<(HTMLDivElement | null)[]>([]);
  const [visibleStates, setVisibleStates] = useState<boolean[]>(
    Array(count).fill(false)
  );

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    refs.current.forEach((element, index) => {
      if (!element) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setTimeout(() => {
                setVisibleStates((prev) => {
                  const newStates = [...prev];
                  newStates[index] = true;
                  return newStates;
                });
              }, index * staggerDelay);

              if (scrollOptions.once !== false) {
                observer.unobserve(element);
              }
            } else if (scrollOptions.once === false) {
              setVisibleStates((prev) => {
                const newStates = [...prev];
                newStates[index] = false;
                return newStates;
              });
            }
          });
        },
        {
          threshold: scrollOptions.threshold || 0.2,
          rootMargin: scrollOptions.rootMargin || "0px",
        }
      );

      observer.observe(element);
      observers.push(observer);
    });

    return () => {
      observers.forEach((observer) => observer.disconnect());
    };
  }, [count, staggerDelay, scrollOptions.threshold, scrollOptions.rootMargin, scrollOptions.once]);

  const setRef = useCallback((index: number) => (el: HTMLDivElement | null) => {
    refs.current[index] = el;
  }, []);

  return { setRef, visibleStates };
}

// 스크롤 진행도 추적 훅
export function useScrollProgress() {
  const [progress, setProgress] = useState(0);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleScroll = () => {
      const rect = element.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // 요소가 뷰포트에 진입하기 시작하면 0, 완전히 지나가면 1
      const elementTop = rect.top;
      const elementHeight = rect.height;

      const start = windowHeight;
      const end = -elementHeight;
      const current = elementTop;

      const rawProgress = (start - current) / (start - end);
      const clampedProgress = Math.min(1, Math.max(0, rawProgress));

      setProgress(clampedProgress);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial calculation

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return { ref: elementRef, progress };
}

// Parallax 효과 훅
interface UseParallaxOptions {
  speed?: number; // 패럴랙스 속도 (1 = 정상, 0.5 = 절반 속도)
  direction?: "up" | "down";
}

export function useParallax(options: UseParallaxOptions = {}) {
  const { speed = 0.5, direction = "up" } = options;
  const [offset, setOffset] = useState(0);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleScroll = () => {
      const rect = element.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const elementCenter = rect.top + rect.height / 2;
      const viewportCenter = windowHeight / 2;

      const distance = elementCenter - viewportCenter;
      const parallaxOffset = distance * speed * (direction === "up" ? -1 : 1);

      setOffset(parallaxOffset);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [speed, direction]);

  return { ref: elementRef, offset };
}

export default useScrollAnimation;
