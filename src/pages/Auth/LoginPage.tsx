/**
 * 로그인 페이지
 * 와이어프레임 스타일 + 소셜 로그인 버튼
 */
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { useAuthStore } from '@/stores/useAuthStore';
import { useThemeStore, backgroundThemeClasses } from '@/stores/useTheme';
import api from '@/api/client';
import { useState } from 'react';

const loginSchema = z.object({
    email: z.string().email('올바른 이메일 형식이 아닙니다.'),
    password: z.string().min(1, '비밀번호를 입력해주세요.'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { setAuth } = useAuthStore();
    const { theme } = useThemeStore();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const from = location.state?.from?.pathname || '/';

    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });

    const onSubmit = async (data: LoginFormValues) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await api.post('/auth/login', data);
            const { user, accessToken } = response.data;
            setAuth(user, accessToken);
            navigate(from, { replace: true });
        } catch (err: any) {
            setError(err.response?.data?.message || '이메일 또는 비밀번호가 일치하지 않습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={`min-h-screen ${backgroundThemeClasses[theme]}`}>
            <main className="container mx-auto px-6 py-20 flex items-center justify-center">
                <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
                    {/* 로고 */}
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                            StoRead
                        </h1>
                        <p className="text-zinc-600">
                            로그인 후 더 많은 기능을 이용해보세요
                        </p>
                    </div>

                    {/* 로그인 폼 */}
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mb-6">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm text-zinc-700">이메일</FormLabel>
                                        <FormControl>
                                            <input
                                                type="email"
                                                placeholder="your@email.com"
                                                className="w-full px-4 py-3 border border-zinc-300 rounded-lg focus:outline-none focus:border-purple-600 transition-colors"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm text-zinc-700">비밀번호</FormLabel>
                                        <FormControl>
                                            <input
                                                type="password"
                                                placeholder="••••••••"
                                                className="w-full px-4 py-3 border border-zinc-300 rounded-lg focus:outline-none focus:border-purple-600 transition-colors"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {error && (
                                <div className="text-sm text-red-500 font-medium">
                                    {error}
                                </div>
                            )}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                            >
                                {isLoading ? '로그인 중...' : '로그인'}
                            </button>
                        </form>
                    </Form>

                    {/* 구분선 */}
                    <div className="relative mb-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-zinc-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-zinc-500">
                                또는 간편 로그인
                            </span>
                        </div>
                    </div>

                    {/* 소셜 로그인 */}
                    <div className="space-y-3">
                        <button className="w-full py-3 px-4 bg-yellow-400 text-zinc-900 rounded-lg hover:bg-yellow-500 transition-colors flex items-center justify-center gap-2 font-medium">
                            <div className="w-5 h-5 bg-zinc-900 rounded flex items-center justify-center">
                                <span className="text-yellow-400 text-xs font-bold">K</span>
                            </div>
                            <span>카카오로 시작하기</span>
                        </button>
                        <button className="w-full py-3 px-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2 font-medium">
                            <div className="w-5 h-5 bg-white rounded flex items-center justify-center">
                                <span className="text-green-500 text-xs font-bold">N</span>
                            </div>
                            <span>네이버로 시작하기</span>
                        </button>
                        <button className="w-full py-3 px-4 bg-white border border-zinc-300 text-zinc-700 rounded-lg hover:bg-zinc-50 transition-colors flex items-center justify-center gap-2 font-medium">
                            <div className="w-5 h-5 flex items-center justify-center">
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                            </div>
                            <span>구글로 시작하기</span>
                        </button>
                    </div>

                    {/* 회원가입 링크 */}
                    <div className="text-center mt-6">
                        <p className="text-zinc-600">
                            계정이 없으신가요?{' '}
                            <Link to="/register" className="text-purple-600 hover:underline font-medium">
                                회원가입
                            </Link>
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default LoginPage;
