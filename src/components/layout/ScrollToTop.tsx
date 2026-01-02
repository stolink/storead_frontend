/**
 * 페이지 전환 시 스크롤을 상단으로 이동시키는 유틸리티 컴포넌트
 * React Router의 useLocation을 사용하여 경로 변경 감지
 */
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop 컴포넌트
 * - 경로가 변경될 때마다 window.scrollTo(0, 0) 호출
 * - BrowserRouter 내부, Routes 컴포넌트 전에 배치해야 함
 */
export const ScrollToTop = () => {
    const { pathname } = useLocation();

    useEffect(() => {
        // 페이지 전환 시 스크롤을 맨 위로 이동
        window.scrollTo(0, 0);
    }, [pathname]);

    // 렌더링할 UI 없음
    return null;
};

export default ScrollToTop;
