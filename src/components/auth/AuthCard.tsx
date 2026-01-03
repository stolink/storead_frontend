/**
 * AuthCard 컴포넌트
 * 로그인/회원가입 탭이 있는 인증 카드
 * stolink와 동일한 스타일 적용
 */
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthStore } from "@/stores/useAuthStore";
import api from "@/api/client";

// --- Validation Schemas ---
const loginSchema = z.object({
  email: z.string().email("유효한 이메일을 입력하세요"),
  password: z.string().min(1, "비밀번호를 입력하세요"),
});

const registerSchema = z
  .object({
    email: z.string().email("유효한 이메일을 입력하세요"),
    password: z.string().min(8, "비밀번호는 8자 이상이어야 합니다"),
    confirmPassword: z.string(),
    nickname: z
      .string()
      .min(2, "닉네임은 2자 이상이어야 합니다")
      .max(20, "닉네임은 20자 이하여야 합니다"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "비밀번호가 일치하지 않습니다",
    path: ["confirmPassword"],
  });

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

interface AuthCardProps {
  className?: string;
  onSuccess?: () => void;
}

// OAuth2 에러 메시지 매핑
const OAUTH_ERROR_MESSAGES: Record<string, string> = {
  oauth_failed: "소셜 로그인에 실패했습니다. 다시 시도해주세요.",
  email_exists: "이미 일반 회원가입으로 등록된 이메일입니다.",
  access_denied: "로그인이 취소되었습니다.",
};

export function AuthCard({ className, onSuccess }: AuthCardProps) {
  const { setAuth } = useAuthStore();
  const [searchParams] = useSearchParams();

  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState<string>("");
  const [activeTab, setActiveTab] = useState("login");
  const [isLoginPending, setIsLoginPending] = useState(false);
  const [isRegisterPending, setIsRegisterPending] = useState(false);

  // URL 파라미터에서 OAuth2 에러 확인
  useEffect(() => {
    const error = searchParams.get("error");
    if (error && OAUTH_ERROR_MESSAGES[error]) {
      setApiError(OAUTH_ERROR_MESSAGES[error]);
    }
  }, [searchParams]);

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      nickname: "",
    },
  });

  const onGoogleLogin = () => {
    // 현재 경로 저장 (로그인 후 돌아올 위치) - 쿼리 파라미터 포함
    localStorage.setItem(
      "oauth_redirect_path",
      window.location.pathname + window.location.search
    );

    const API_URL =
      import.meta.env.VITE_API_BASE_URL || "http://localhost:8081/api";
    const BACKEND_URL = API_URL.replace(/\/api\/?$/, "");
    window.location.href = `${BACKEND_URL}/oauth2/authorization/google`;
  };

  const onLogin = async (data: LoginFormData) => {
    setApiError("");
    setIsLoginPending(true);
    try {
      const response = await api.post("/auth/login", data);
      const { user, accessToken } = response.data.data;
      setAuth(user, accessToken);
      onSuccess?.();
    } catch (err: any) {
      setApiError(
        err.response?.data?.message ||
          "이메일 또는 비밀번호가 일치하지 않습니다."
      );
    } finally {
      setIsLoginPending(false);
    }
  };

  const onRegister = async (data: RegisterFormData) => {
    setApiError("");
    setIsRegisterPending(true);
    try {
      await api.post("/auth/register", {
        email: data.email,
        password: data.password,
        nickname: data.nickname,
      });
      alert("가입이 완료되었습니다. 로그인해주세요.");
      setActiveTab("login");
      registerForm.reset();
    } catch (err: any) {
      setApiError(err.response?.data?.message || "회원가입에 실패했습니다.");
    } finally {
      setIsRegisterPending(false);
    }
  };

  return (
    <Card
      className={`w-full overflow-hidden bg-white shadow-2xl border-none ${className}`}
      style={{
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
      }}
    >
      <div className="flex flex-col md:flex-row min-h-[550px]">
        {/* Left Column: Auth Form */}
        <div className="flex-1 p-8 md:p-10 bg-white">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-zinc-900 tracking-tight mb-1">
              {activeTab === "login" ? "다시 만나서 반갑습니다" : "새로운 시작"}
            </h2>
            <p className="text-sm text-zinc-500 font-medium">
              {activeTab === "login"
                ? "StoRead와 함께 당신의 이야기를 계속 이어가세요"
                : "StoRead에 가입하고 더 많은 작품을 만나보세요"}
            </p>
          </div>

          <div className="space-y-6">
            {/* Google Login (Primary) */}
            <Button
              type="button"
              className="w-full h-11 text-sm font-bold relative bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 hover:border-purple-400 transition-all duration-200 shadow-sm"
              onClick={onGoogleLogin}
            >
              <svg
                className="mr-3 h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 48 48"
              >
                <path
                  fill="#FFC107"
                  d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
                />
                <path
                  fill="#FF3D00"
                  d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
                />
                <path
                  fill="#4CAF50"
                  d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
                />
                <path
                  fill="#1976D2"
                  d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
                />
              </svg>
              Google로 계속하기
            </Button>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-zinc-200" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase">
                <span className="bg-white px-3 text-zinc-400 font-bold tracking-widest">
                  또는 이메일로 계속하기
                </span>
              </div>
            </div>

            <Tabs
              value={activeTab}
              onValueChange={(val) => {
                setActiveTab(val);
                setApiError("");
              }}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 mb-6 h-10 bg-zinc-100 p-1 rounded-lg">
                <TabsTrigger
                  value="login"
                  className="text-xs font-bold rounded-md data-[state=active]:bg-white data-[state=active]:text-purple-700 data-[state=active]:shadow-sm transition-all"
                >
                  로그인
                </TabsTrigger>
                <TabsTrigger
                  value="register"
                  className="text-xs font-bold rounded-md data-[state=active]:bg-white data-[state=active]:text-purple-700 data-[state=active]:shadow-sm transition-all"
                >
                  회원가입
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form
                  onSubmit={loginForm.handleSubmit(onLogin)}
                  className="space-y-4"
                >
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="email"
                      className="text-xs font-bold text-zinc-700 ml-0.5"
                    >
                      이메일 주소
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      className="h-10 text-sm border-zinc-200 bg-zinc-50 focus:bg-white focus:ring-purple-500/20 focus:border-purple-500 transition-all font-medium"
                      {...loginForm.register("email")}
                    />
                    {loginForm.formState.errors.email && (
                      <p className="text-[11px] text-red-500 font-bold mt-1 ml-0.5">
                        {loginForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label
                        htmlFor="password"
                        className="text-xs font-bold text-zinc-700 ml-0.5"
                      >
                        비밀번호
                      </Label>
                      <button
                        type="button"
                        className="text-[11px] font-bold text-purple-500 hover:text-purple-700 hover:underline transition-colors"
                      >
                        비밀번호를 잊으셨나요?
                      </button>
                    </div>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        className="h-10 text-sm border-zinc-200 bg-zinc-50 focus:bg-white focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                        {...loginForm.register("password")}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {loginForm.formState.errors.password && (
                      <p className="text-[11px] text-red-500 font-bold mt-1 ml-0.5">
                        {loginForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-11 text-sm font-bold bg-purple-600 hover:bg-purple-700 text-white transition-all shadow-md hover:shadow-lg mt-4 border-none"
                    disabled={isLoginPending}
                  >
                    {isLoginPending ? "처리 중..." : "로그인"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register">
                <form
                  onSubmit={registerForm.handleSubmit(onRegister)}
                  className="space-y-3"
                >
                  <div className="space-y-1">
                    <Label
                      htmlFor="reg-email"
                      className="text-xs font-bold text-zinc-700"
                    >
                      이메일
                    </Label>
                    <Input
                      id="reg-email"
                      type="email"
                      className="h-10 text-sm border-zinc-200 bg-zinc-50 focus:bg-white focus:ring-purple-500/20 focus:border-purple-500 transition-all font-medium"
                      {...registerForm.register("email")}
                    />
                    {registerForm.formState.errors.email && (
                      <p className="text-[11px] text-red-500 font-bold mt-1 ml-0.5">
                        {registerForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Label
                      htmlFor="reg-nickname"
                      className="text-xs font-bold text-zinc-700"
                    >
                      닉네임
                    </Label>
                    <Input
                      id="reg-nickname"
                      className="h-10 text-sm border-zinc-200 bg-zinc-50 focus:bg-white focus:ring-purple-500/20 focus:border-purple-500 transition-all font-medium"
                      {...registerForm.register("nickname")}
                    />
                    {registerForm.formState.errors.nickname && (
                      <p className="text-[11px] text-red-500 font-bold mt-1 ml-0.5">
                        {registerForm.formState.errors.nickname.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Label
                      htmlFor="reg-pass"
                      className="text-xs font-bold text-zinc-700"
                    >
                      비밀번호
                    </Label>
                    <Input
                      id="reg-pass"
                      type="password"
                      placeholder="8자 이상"
                      className="h-10 text-sm border-zinc-200 bg-zinc-50 focus:bg-white focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                      {...registerForm.register("password")}
                    />
                    {registerForm.formState.errors.password && (
                      <p className="text-[11px] text-red-500 font-bold mt-1 ml-0.5">
                        {registerForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Label
                      htmlFor="reg-confirm"
                      className="text-xs font-bold text-zinc-700"
                    >
                      비밀번호 확인
                    </Label>
                    <Input
                      id="reg-confirm"
                      type="password"
                      className="h-10 text-sm border-zinc-200 bg-zinc-50 focus:bg-white focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                      {...registerForm.register("confirmPassword")}
                    />
                    {registerForm.formState.errors.confirmPassword && (
                      <p className="text-[11px] text-red-500 font-bold mt-1 ml-0.5">
                        {registerForm.formState.errors.confirmPassword.message}
                      </p>
                    )}
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-11 text-sm font-bold bg-purple-600 hover:bg-purple-700 text-white transition-all shadow-md mt-4 border-none"
                    disabled={isRegisterPending}
                  >
                    {isRegisterPending ? "처리 중..." : "회원가입 완료"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            {apiError && (
              <p className="text-xs text-red-500 bg-red-50 p-2.5 rounded-md text-center border border-red-100 font-bold">
                {apiError}
              </p>
            )}
          </div>
        </div>

        {/* Right Column: Brand Visual (Hidden on mobile) */}
        <div className="hidden md:flex flex-1 bg-gradient-to-br from-purple-500 to-purple-700 p-10 text-white flex-col justify-between relative overflow-hidden">
          {/* Abstract visual elements */}
          <div className="absolute top-[-10%] right-[-10%] w-[300px] h-[300px] bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-[-5%] left-[-5%] w-[200px] h-[200px] bg-purple-400/10 rounded-full blur-2xl" />

          <div className="relative z-10">
            <div className="flex items-center space-x-2 mb-10 opacity-90">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center font-bold text-white">
                S
              </div>
              <span className="font-bold text-xl tracking-tight text-white">
                StoRead
              </span>
            </div>

            <h3 className="text-3xl font-bold mb-4 leading-tight text-white">
              이야기의 세계로
              <br />
              빠져들어 보세요
            </h3>
            <p className="text-white/80 text-sm leading-relaxed max-w-[280px]">
              다양한 장르의 웹소설을 만나보세요. StoRead가 당신의 독서 여정을
              함께합니다.
            </p>
          </div>

          <div className="relative z-10">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-5 border border-white/10 shadow-xl">
              <div className="flex items-center space-x-4 mb-3">
                <div className="w-10 h-10 rounded-full bg-purple-400/30 flex items-center justify-center border border-white/20 overflow-hidden">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
                <div>
                  <div className="text-xs font-bold text-white">
                    수많은 독자들의 선택
                  </div>
                  <div className="text-[10px] text-white/70">
                    함께 성장하는 웹소설 플랫폼
                  </div>
                </div>
              </div>
              <p className="text-xs italic text-white/90">
                "출퇴근 시간마다 StoRead로 웹소설을 읽고 있어요. 정말 편리하고
                다양한 작품들이 있어서 좋아요."
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
