import { useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';
import { useAuthModalStore } from '@/stores/useAuthModalStore';

/**
 * 인증이 필요한 액션을 위한 가드 훅
 * @param action 실행할 함수
 * @returns 인증 확인 후 action 실행 또는 로그인 모달 표시하는 함수
 */
export const useAuthAction = (action: () => void) => {
    const location = useLocation();
    const { isAuthenticated } = useAuthStore();
    const { openAuthModal } = useAuthModalStore();

    return () => {
        if (!isAuthenticated) {
            // 로그인 페이지 대신 모달을 표시
            openAuthModal(location.pathname);
            return;
        }
        action();
    };
};
