/**
 * 레이아웃 컴포넌트
 * 헤더 + 메인 콘텐츠 영역
 * 전역 테마 시스템 지원
 */
import { Outlet } from 'react-router-dom';
import Header from './Header';
import { useThemeStore, backgroundThemeClasses } from '@/stores/useTheme';

interface LayoutProps {
    children?: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
    const { theme } = useThemeStore();

    return (
        <div className={`min-h-screen transition-colors duration-300 ${backgroundThemeClasses[theme]}`}>
            <Header />
            <main>{children || <Outlet />}</main>
        </div>
    );
};

export default Layout;
