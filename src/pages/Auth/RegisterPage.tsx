/**
 * 회원가입 페이지
 * AuthCard 컴포넌트 사용 (회원가입 탭으로 시작)
 */
import { useThemeStore, backgroundThemeClasses } from "@/stores/useTheme";
import { AuthCard } from "@/components/auth/AuthCard";

export const RegisterPage = () => {
    const { theme } = useThemeStore();

    return (
        <div
            className={`min-h-screen ${backgroundThemeClasses[theme]} flex items-center justify-center p-4`}
        >
            <div className="w-full max-w-[850px]">
                <AuthCard />
            </div>
        </div>
    );
};

export default RegisterPage;
