/**
 * OAuth2 콜백 페이지
 * 구글 로그인 후 백엔드에서 리다이렉트되는 페이지
 * 쿠키 기반 인증 - 백엔드가 쿠키를 설정하므로 토큰 처리 불필요
 */
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";
import api from "@/api/client";

export default function OAuth2Callback() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  // React.StrictMode에서 두 번 실행 방지
  const processedRef = useRef(false);

  useEffect(() => {
    if (processedRef.current) return;

    const processLogin = async (retryCount = 0) => {
      // 1. 첫 시도 전에 약간의 지연 (쿠키 설정 대기)
      if (retryCount === 0) {
        processedRef.current = true;
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      try {
        // 쿠키 기반 인증: 백엔드가 이미 쿠키를 설정함
        // /auth/me 호출 시 쿠키가 자동으로 전송됨
        const response = await api.get("/auth/me");
        const user = response.data.data;

        // 인증 상태 설정
        setAuth(user);

        // 원래 페이지로 이동 (없으면 홈으로)
        const redirectPath = localStorage.getItem("oauth_redirect_path") || "/";
        localStorage.removeItem("oauth_redirect_path");
        navigate(redirectPath, { replace: true });
      } catch (error) {
        console.error(
          `OAuth2 Login Failed (Attempt ${retryCount + 1}):`,
          error
        );

        // 2. 401 에러 발생 시 최대 2번 재시도 (쿠키 지연 고려)
        if (retryCount < 2) {
          console.log("Retrying login check...");
          setTimeout(() => processLogin(retryCount + 1), 1000);
        } else {
          navigate("/?error=oauth_failed", { replace: true });
        }
      }
    };

    processLogin();
  }, [navigate, setAuth]);

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-gradient-to-br from-mocha-400/20 to-sage-100 gap-4">
      <div className="w-10 h-10 border-4 border-mocha-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-mocha-700 font-medium">로그인 처리 중...</p>
    </div>
  );
}
