/**
 * 로그인 페이지
 */
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { useAuthStore } from '@/stores/useAuthStore';
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
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 이전 페이지 경로 (없으면 홈으로)
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
        <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-900 px-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold">로그인</CardTitle>
                    <CardDescription>
                        이메일과 비밀번호를 입력하여 로그인하세요
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>이메일</FormLabel>
                                        <FormControl>
                                            <Input placeholder="example@email.com" {...field} />
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
                                        <FormLabel>비밀번호</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="••••••" {...field} />
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
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? '로그인 중...' : '로그인'}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <p className="text-sm text-zinc-500">
                        계정이 없으신가요?{' '}
                        <Link to="/register" className="text-indigo-600 hover:underline">
                            회원가입
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
};

export default LoginPage;
