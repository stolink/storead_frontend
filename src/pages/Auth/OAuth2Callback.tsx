/**
 * OAuth2 콜백 페이지
 * 구글 로그인 후 백엔드에서 리다이렉트되는 페이지
 */
import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";
import api from "@/api/client";

export default function OAuth2Callback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  // React.StrictMode에서 두 번 실행 방지
  const processedRef = useRef(false);

  useEffect(() => {
    if (processedRef.current) return;

    const processLogin = async () => {
      const accessToken = searchParams.get("accessToken");

      if (accessToken) {
        processedRef.current = true;

        try {
          // 1. 토큰을 먼저 localStorage에 저장 (API 호출 시 헤더에 사용)
          localStorage.setItem("accessToken", accessToken);

          // 2. 사용자 정보 가져오기
          const response = await api.get("/auth/me");
          const user = response.data.data;

          // 3. 인증 상태 설정
          setAuth(user, accessToken);

          // 4. 원래 페이지로 이동 (없으면 홈으로)
          const redirectPath =
            localStorage.getItem("oauth_redirect_path") || "/";
          localStorage.removeItem("oauth_redirect_path");
          navigate(redirectPath, { replace: true });
        } catch (error) {
          console.error("OAuth2 Login Failed:", error);
          localStorage.removeItem("accessToken");
          navigate("/?error=oauth_failed", { replace: true });
        }
      } else {
        // 토큰이 없으면 로그인 실패 처리
        console.error("No access token found in URL");
        navigate("/?error=no_token", { replace: true });
      }
    };

    processLogin();
  }, [searchParams, navigate, setAuth]);

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-gradient-to-br from-mocha-400/20 to-sage-100 gap-4">
      <div className="w-10 h-10 border-4 border-mocha-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-mocha-700 font-medium">로그인 처리 중...</p>
    </div>
  );
}
