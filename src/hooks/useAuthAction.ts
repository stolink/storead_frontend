import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';

/**
 * 인증이 필요한 액션을 위한 가드 훅
 * @param action 실행할 함수
 * @returns 인증 확인 후 action 실행 또는 로그인 페이지로 리다이렉트하는 함수
 */
export const useAuthAction = (action: () => void) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated } = useAuthStore();

    return () => {
        if (!isAuthenticated) {
            navigate('/login', { state: { from: location } });
            return;
        }
        action();
    };
};
