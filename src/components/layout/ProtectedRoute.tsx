/**
 * 인증 보호 라우트 컴포넌트
 * 로그인이 필요한 페이지 접근 제어
 */
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    const location = useLocation();
    const { isAuthenticated } = useAuthStore();

    if (!isAuthenticated) {
        // 로그인 페이지로 리다이렉트, 현재 위치 저장
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
