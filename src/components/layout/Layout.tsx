/**
 * 레이아웃 컴포넌트
 * 헤더 + 메인 콘텐츠 영역
 */
import { Outlet } from 'react-router-dom';
import Header from './Header';

interface LayoutProps {
    children?: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
            <Header />
            <main>{children || <Outlet />}</main>
        </div>
    );
};

export default Layout;
