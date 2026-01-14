/**
 * 인증 초기화 훅
 * 앱 시작 시 서버에서 인증 상태를 확인하여 세션 복원
 */
import { useEffect, useState, useRef } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { authService } from "@/services/authService";

export function useAuthInit() {
  const [isInitializing, setIsInitializing] = useState(true);
  const setUser = useAuthStore((state) => state.setUser);
  const logout = useAuthStore((state) => state.logout);
  const initialized = useRef(false);

  useEffect(() => {
    // 1. 이미 초기화가 진행되었거나 완료되었다면 중복 실행 방지
    if (initialized.current) return;
    initialized.current = true;

    // 2. 인증 관련 페이지에서는 자동 로그인 체크 건너뛰기
    // /oauth2/* 경로는 콜백 처리 등 특수 로직이 있으므로 건너뜁니다.
    const pathname = window.location.pathname;
    if (pathname.startsWith("/oauth2/")) {
      setIsInitializing(false);
      return;
    }

    const initAuth = async () => {
      try {
        // 3. 쿠키가 유효하면 바로 사용자 정보 조회 (자동 로그인)
        const userResponse = await authService.getMe();
        setUser(userResponse.data);
      } catch {
        // 4. 401 에러 시 refresh 시도
        try {
          await authService.refresh();
          const userResponse = await authService.getMe();
          setUser(userResponse.data);
        } catch (error) {
          // 400 에러(쿠키 없음)인 경우 즉시 중단하고 초기화 완료 처리
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          if ((error as any).response?.status === 400) {
            console.log("[AuthInit] No refresh token (400). Stopping init.");
            logout();
            setIsInitializing(false);
            return;
          }

          logout();
        }
      } finally {
        setIsInitializing(false);
      }
    };

    initAuth();
  }, [setUser, logout]);

  return isInitializing;
}

