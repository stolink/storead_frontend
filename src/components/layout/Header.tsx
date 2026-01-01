/**
 * 공통 헤더 컴포넌트
 * 네비게이션 및 사용자 메뉴
 */
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const Header = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated, logout } = useAuthStore();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:border-zinc-800 dark:bg-zinc-900/95">
            <div className="max-w-6xl mx-auto px-4">
                <div className="flex h-16 items-center justify-between">
                    {/* 로고 */}
                    <Link to="/" className="flex items-center gap-2">
                        <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            StoRead
                        </span>
                    </Link>

                    {/* 네비게이션 */}
                    <nav className="hidden md:flex items-center gap-6">
                        <Link
                            to="/"
                            className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
                        >
                            탐색
                        </Link>
                        {isAuthenticated && (
                            <>
                                <Link
                                    to="/library"
                                    className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
                                >
                                    내 서재
                                </Link>
                                <Link
                                    to="/author"
                                    className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
                                >
                                    작품 관리
                                </Link>
                            </>
                        )}
                    </nav>

                    {/* 사용자 메뉴 */}
                    <div className="flex items-center gap-4">
                        {isAuthenticated ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage
                                                src={user?.profileImageUrl}
                                                alt={user?.nickname}
                                            />
                                            <AvatarFallback>
                                                {user?.nickname?.charAt(0)?.toUpperCase() || 'U'}
                                            </AvatarFallback>
                                        </Avatar>
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                    <div className="px-2 py-1.5">
                                        <p className="text-sm font-medium">{user?.nickname}</p>
                                        <p className="text-xs text-zinc-500">{user?.email}</p>
                                    </div>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => navigate('/profile')}>
                                        프로필 설정
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => navigate('/library')}>
                                        내 서재
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => navigate('/author')}>
                                        작품 관리
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={handleLogout}
                                        className="text-red-600 focus:text-red-600"
                                    >
                                        로그아웃
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => navigate('/login')}
                                >
                                    로그인
                                </Button>
                                <Button size="sm" onClick={() => navigate('/register')}>
                                    회원가입
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
