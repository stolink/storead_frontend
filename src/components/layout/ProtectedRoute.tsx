/**
 * 인증 보호 라우트 컴포넌트
 * 로그인이 필요한 페이지 접근 제어
 * 로그인 안 된 경우 현재 페이지에서 모달을 띄움
 */
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";
import { useAuthModalStore } from "@/stores/useAuthModalStore";

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const ProtectedRoute = ({ children, fallback }: ProtectedRouteProps) => {
  const location = useLocation();
  const { isAuthenticated } = useAuthStore();
  const { openAuthModal } = useAuthModalStore();

  useEffect(() => {
    if (!isAuthenticated) {
      // 현재 경로를 저장하면서 모달 열기
      openAuthModal(location.pathname);
    }
  }, [isAuthenticated, openAuthModal, location.pathname]);

  if (!isAuthenticated) {
    // 리다이렉트 대신 fallback UI 표시 (또는 빈 화면)
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-zinc-500">로그인이 필요합니다.</p>
        </div>
      )
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
