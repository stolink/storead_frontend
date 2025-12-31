/**
 * 회원가입 페이지
 */
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
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
import api from '@/api/client';
import { useState } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';

const registerSchema = z.object({
    email: z.string().email('올바른 이메일 형식이 아닙니다.'),
    password: z
        .string()
        .min(8, '비밀번호는 최소 8자 이상이어야 합니다.')
        .regex(/[a-zA-Z]/, '영문자를 포함해야 합니다.')
        .regex(/[0-9]/, '숫자를 포함해야 합니다.')
        .regex(/[^a-zA-Z0-9]/, '특수문자를 포함해야 합니다.'),
    confirmPassword: z.string(),
    nickname: z.string().min(2, '닉네임은 최소 2자 이상이어야 합니다.'),
}).refine((data) => data.password === data.confirmPassword, {
    message: '비밀번호가 일치하지 않습니다.',
    path: ['confirmPassword'],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export const RegisterPage = () => {
    const navigate = useNavigate();
    const { setAuth } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const form = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            email: '',
            password: '',
            confirmPassword: '',
            nickname: '',
        },
    });

    const onSubmit = async (data: RegisterFormValues) => {
        setIsLoading(true);
        setError(null);
        try {
            // 회원가입 요청
            const response = await api.post('/auth/register', {
                email: data.email,
                password: data.password,
                nickname: data.nickname,
            });

            // 가입 성공 시 자동 로그인 처리 또는 로그인 페이지로 이동
            // 여기서는 자동 로그인 처리 (API 응답이 로그인과 같다면)
            if (response.data.accessToken) {
                const { user, accessToken } = response.data;
                setAuth(user, accessToken);
                navigate('/');
            } else {
                // 토큰 없으면 로그인 페이지로
                navigate('/login');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || '회원가입 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-900 px-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold">회원가입</CardTitle>
                    <CardDescription>
                        새로운 계정을 만들고 서비스를 이용해보세요
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
                                name="nickname"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>닉네임</FormLabel>
                                        <FormControl>
                                            <Input placeholder="사용할 닉네임" {...field} />
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
                                            <Input type="password" placeholder="영문, 숫자, 특수문자 포함 8자 이상" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>비밀번호 확인</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="비밀번호 재입력" {...field} />
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
                                {isLoading ? '가입 중...' : '회원가입'}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <p className="text-sm text-zinc-500">
                        이미 계정이 있으신가요?{' '}
                        <Link to="/login" className="text-indigo-600 hover:underline">
                            로그인
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
};

export default RegisterPage;
