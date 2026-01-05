import { useEffect, useRef, useState } from 'react';

export function useIntersectionObserver(options?: IntersectionObserverInit) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    // options 객체를 분해하여 의존성 배열에서 안정적으로 참조
    // 호출부에서 객체 리터럴을 전달해도 불필요한 재등록 방지
    const root = options?.root;
    const rootMargin = options?.rootMargin;
    const threshold = options?.threshold;

    useEffect(() => {
        const observerOptions: IntersectionObserverInit = {
            root: root as Element | Document | null | undefined,
            rootMargin,
            threshold,
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                setIsVisible(entry.isIntersecting);
            });
        }, observerOptions);

        const currentElement = containerRef.current;
        if (currentElement) {
            observer.observe(currentElement);
        }

        return () => {
            if (currentElement) {
                observer.unobserve(currentElement);
            }
        };
    }, [root, rootMargin, threshold]);

    return { containerRef, isVisible };
}
