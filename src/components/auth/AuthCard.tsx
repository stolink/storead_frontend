/**
 * AuthCard 컴포넌트
 * 로그인/회원가입 탭이 있는 인증 카드
 * stolink_frontend와 동일한 스타일 적용
 */
import { useState } from "react";
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

export function AuthCard({
  className,
  onSuccess,
}: {
  className?: string;
  onSuccess?: () => void;
}) {
  const { setAuth } = useAuthStore();

  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState<string>("");
  const [activeTab, setActiveTab] = useState("login");
  const [isLoginPending, setIsLoginPending] = useState(false);
  const [isRegisterPending, setIsRegisterPending] = useState(false);

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
    const currentPath = window.location.pathname + window.location.search;
    localStorage.setItem("oauth_redirect_path", currentPath);

    const API_URL =
      import.meta.env.VITE_API_BASE_URL ||
      import.meta.env.VITE_API_URL ||
      "http://localhost:8081/api";
    const BACKEND_URL = API_URL.replace(/\/api\/?$/, "");

    // state 파라미터에 리다이렉트 경로 추가 (URL 인코딩)
    const state = encodeURIComponent(currentPath);
    window.location.href = `${BACKEND_URL}/oauth2/authorization/google?state=${state}`;
  };

  const handleApiError = (error: unknown, defaultMsg: string) => {
    const errorMsg =
      (error as { response?: { data?: { error?: { message?: string } } } })
        ?.response?.data?.error?.message || defaultMsg;
    setApiError(errorMsg);
  };

  const onLogin = async (data: LoginFormData) => {
    setApiError("");
    setIsLoginPending(true);
    try {
      const response = await api.post("/auth/login", data);
      // ApiResponse 래퍼 구조: { code, status, message, data: { accessToken, user, ... } }
      const { accessToken, user } = response.data.data;
      setAuth(user, accessToken);
      onSuccess?.();
    } catch (error) {
      handleApiError(error, "로그인에 실패했습니다");
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
    } catch (error) {
      handleApiError(error, "회원가입에 실패했습니다");
    } finally {
      setIsRegisterPending(false);
    }
  };

  return (
    <Card
      className={`w-full overflow-hidden bg-white rounded-[2rem] shadow-xl border-none p-0 ${className}`}
      style={{
        boxShadow: "0 25px 50px -12px rgba(61, 48, 42, 0.25)", // Warm Mocha Shadow
      }}
    >
      <div className="flex flex-col md:flex-row md:min-h-[550px]">
        {/* Left Column: Auth Form */}
        <div className="flex-1 p-8 md:p-10 bg-white">
          <div className="mb-8">
            <h2 className="text-2xl font-heading font-bold text-ink tracking-tight mb-1">
              {activeTab === "login" ? "다시 만나서 반갑습니다" : "새로운 시작"}
            </h2>
            <p className="text-sm text-ink/60 font-medium">
              {activeTab === "login"
                ? "StoRead와 함께 당신의 이야기를 계속 이어가세요"
                : "StoRead에 가입하고 더 많은 작품을 만나보세요"}
            </p>
          </div>

          <div className="space-y-6">
            {/* Google Login (Primary) */}
            <Button
              type="button"
              className="w-full h-11 text-sm font-bold relative bg-white border border-cloud-50 text-ink/80 hover:bg-cloud-50 hover:text-ink hover:border-mocha-400 transition-all duration-200 shadow-sm"
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
                <span className="w-full border-t border-cloud-50" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase">
                <span className="bg-white px-3 text-ink/30 font-bold tracking-widest">
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
              <TabsList className="grid w-full grid-cols-2 mb-6 h-12 p-1.5 rounded-xl" style={{ backgroundColor: 'rgba(241, 240, 236, 0.8)' }}>
                <TabsTrigger
                  value="login"
                  className="text-sm font-bold rounded-lg data-[state=active]:bg-white data-[state=active]:text-mocha-900 data-[state=active]:shadow-sm transition-all duration-300"
                >
                  로그인
                </TabsTrigger>
                <TabsTrigger
                  value="register"
                  className="text-sm font-bold rounded-lg data-[state=active]:bg-white data-[state=active]:text-mocha-900 data-[state=active]:shadow-sm transition-all duration-300"
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
                      className="text-xs font-bold text-ink/80 ml-0.5"
                    >
                      이메일 주소
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      className="h-10 text-sm transition-all font-medium"
                      style={{ border: '1px solid #F1F0EC', backgroundColor: 'rgba(241, 240, 236, 0.2)' }}
                      {...loginForm.register("email")}
                    />
                    {loginForm.formState.errors.email && (
                      <p className="text-[11px] text-status-error font-bold mt-1 ml-0.5">
                        {loginForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label
                        htmlFor="password"
                        className="text-xs font-bold text-ink/80 ml-0.5"
                      >
                        비밀번호
                      </Label>
                      <button
                        type="button"
                        className="text-[11px] font-bold text-mocha-500 hover:text-mocha-700 hover:underline transition-colors"
                      >
                        비밀번호를 잊으셨나요?
                      </button>
                    </div>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        className="h-10 text-sm transition-all"
                        style={{ border: '1px solid #F1F0EC', backgroundColor: 'rgba(241, 240, 236, 0.2)' }}
                        {...loginForm.register("password")}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/30 hover:text-ink/60 transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {loginForm.formState.errors.password && (
                      <p className="text-[11px] text-status-error font-bold mt-1 ml-0.5">
                        {loginForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-11 text-sm font-bold text-white transition-all shadow-md hover:shadow-lg mt-4 border-none"
                    style={{ backgroundColor: '#A47764' }}
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
                      className="text-xs font-bold text-ink/80"
                    >
                      이메일
                    </Label>
                    <Input
                      id="reg-email"
                      type="email"
                      className="h-10 text-sm transition-all font-medium"
                      style={{ border: '1px solid #F1F0EC', backgroundColor: 'rgba(241, 240, 236, 0.2)' }}
                      {...registerForm.register("email")}
                    />
                    {registerForm.formState.errors.email && (
                      <p className="text-[11px] text-status-error font-bold mt-1 ml-0.5">
                        {registerForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Label
                      htmlFor="reg-nickname"
                      className="text-xs font-bold text-ink/80"
                    >
                      닉네임
                    </Label>
                    <Input
                      id="reg-nickname"
                      className="h-10 text-sm transition-all font-medium"
                      style={{ border: '1px solid #F1F0EC', backgroundColor: 'rgba(241, 240, 236, 0.2)' }}
                      {...registerForm.register("nickname")}
                    />
                    {registerForm.formState.errors.nickname && (
                      <p className="text-[11px] text-status-error font-bold mt-1 ml-0.5">
                        {registerForm.formState.errors.nickname.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Label
                      htmlFor="reg-pass"
                      className="text-xs font-bold text-ink/80"
                    >
                      비밀번호
                    </Label>
                    <Input
                      id="reg-pass"
                      type="password"
                      placeholder="8자 이상"
                      className="h-10 text-sm transition-all"
                      style={{ border: '1px solid #F1F0EC', backgroundColor: 'rgba(241, 240, 236, 0.2)' }}
                      {...registerForm.register("password")}
                    />
                    {registerForm.formState.errors.password && (
                      <p className="text-[11px] text-status-error font-bold mt-1 ml-0.5">
                        {registerForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Label
                      htmlFor="reg-confirm"
                      className="text-xs font-bold text-ink/80"
                    >
                      비밀번호 확인
                    </Label>
                    <Input
                      id="reg-confirm"
                      type="password"
                      className="h-10 text-sm transition-all"
                      style={{ border: '1px solid #F1F0EC', backgroundColor: 'rgba(241, 240, 236, 0.2)' }}
                      {...registerForm.register("confirmPassword")}
                    />
                    {registerForm.formState.errors.confirmPassword && (
                      <p className="text-[11px] text-status-error font-bold mt-1 ml-0.5">
                        {registerForm.formState.errors.confirmPassword.message}
                      </p>
                    )}
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-11 text-sm font-bold text-white transition-all shadow-md mt-4 border-none"
                    style={{ backgroundColor: '#A47764' }}
                    disabled={isRegisterPending}
                  >
                    {isRegisterPending ? "처리 중..." : "회원가입 완료"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            {apiError && (
              <p className="text-xs text-status-error bg-red-50 p-2.5 rounded-md text-center border border-red-100 font-bold">
                {apiError}
              </p>
            )}
          </div>
        </div>

        {/* Right Column: Brand Visual (Hidden on mobile) - stolink 스타일 */}
        <div
          className="hidden md:flex flex-1 self-stretch p-10 flex-col justify-between relative overflow-hidden rounded-r-[2rem]"
          style={{
            background: 'linear-gradient(to bottom right, #A47764, #7D5A4B)',
            color: '#F1F0EC' // paper 색상 직접 지정
          }}
        >
          {/* Abstract visual elements */}
          <div className="absolute top-[-10%] right-[-10%] w-[300px] h-[300px] bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-[-5%] left-[-5%] w-[200px] h-[200px] bg-white/10 rounded-full blur-2xl" />

          <div className="relative z-10">
            <div className="flex items-center space-x-2 mb-10 opacity-90">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center font-heading font-black text-paper">
                S
              </div>
              <span className="font-heading font-bold text-xl tracking-tight text-paper">
                StoRead
              </span>
            </div>

            <h3 className="text-3xl font-heading font-bold mb-4 leading-tight text-paper">
              이야기의 세계로
              <br />
              빠져들어 보세요
            </h3>
            <p className="text-paper/80 text-sm leading-relaxed max-w-[280px]">
              다양한 장르의 웹소설을 만나보세요. StoRead가 당신의 독서 여정을
              함께합니다.
            </p>
          </div>

          <div className="relative z-10">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-5 border border-white/10 shadow-xl">
              <div className="flex items-center space-x-4 mb-3">
                <div className="w-10 h-10 rounded-full bg-mocha-400/30 flex items-center justify-center border border-white/20 overflow-hidden">
                  <svg
                    className="w-6 h-6 text-paper"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
                <div>
                  <div className="text-xs font-bold text-paper">
                    수많은 독자들의 선택
                  </div>
                  <div className="text-[10px] text-paper/70">
                    함께 성장하는 웹소설 플랫폼
                  </div>
                </div>
              </div>
              <p className="text-xs italic text-paper/90">
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
