/**
 * App.tsx
 * React Router + TanStack Query Provider 설정
 */
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// 레이아웃 컴포넌트
import Layout from "@/components/layout/Layout";
import ProtectedRoute from "@/components/layout/ProtectedRoute";

// 전역 AuthModal
import { AuthModal } from "@/components/auth/AuthModal";
import { useAuthModalStore } from "@/stores/useAuthModalStore";

// 공개 페이지
import HomePage from "@/pages/HomePage";
import WorkDetailPage from "@/pages/WorkDetailPage";
import ChapterViewerPage from "@/pages/ChapterViewerPage";
import ChapterCommentsPage from "@/pages/ChapterCommentsPage";
import LibraryPage from "@/pages/LibraryPage";
import WritePage from "@/pages/WritePage";

// 인증 페이지
import OAuth2Callback from "@/pages/Auth/OAuth2Callback";

// 작가 페이지
import AuthorDashboardPage from "@/pages/Author/AuthorDashboardPage";
import NewWorkPage from "@/pages/Author/NewWorkPage";
import WorkEditPage from "@/pages/Author/WorkEditPage";
import ChapterManagePage from "@/pages/Author/ChapterManagePage";
import NewChapterPage from "@/pages/Author/NewChapterPage";
import ChapterEditPage from "@/pages/Author/ChapterEditPage";

// 프로필 페이지
import ProfilePage from "@/pages/Profile/ProfilePage";

// TanStack Query 클라이언트
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5분
      gcTime: 1000 * 60 * 30, // 30분 (이전 cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function AppContent() {
  const { isOpen, closeAuthModal } = useAuthModalStore();

  return (
    <>
      <Routes>
        {/* 공개 페이지 (헤더 포함) */}
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/works/:id" element={<WorkDetailPage />} />
          <Route
            path="/library"
            element={
              <ProtectedRoute>
                <LibraryPage />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* 챕터 뷰어 (전체 화면, 헤더 없음) */}
        <Route path="/chapters/:id" element={<ChapterViewerPage />} />

        {/* 챕터 댓글 페이지 */}
        <Route
          path="/chapters/:id/comments"
          element={<ChapterCommentsPage />}
        />

        {/* OAuth2 콜백 */}
        <Route path="/oauth2/callback" element={<OAuth2Callback />} />

        {/* 커뮤니티 배포 - 게시 확인 페이지 */}
        <Route path="/write" element={<WritePage />} />

        {/* 작가 페이지 (인증 필요) */}
        <Route
          path="/author"
          element={
            <ProtectedRoute>
              <AuthorDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/author/works/new"
          element={
            <ProtectedRoute>
              <NewWorkPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/author/works/:id"
          element={
            <ProtectedRoute>
              <WorkEditPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/author/works/:workId/chapters"
          element={
            <ProtectedRoute>
              <ChapterManagePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/author/works/:workId/chapters/new"
          element={
            <ProtectedRoute>
              <NewChapterPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/author/chapters/:id/edit"
          element={
            <ProtectedRoute>
              <ChapterEditPage />
            </ProtectedRoute>
          }
        />

        {/* 프로필 페이지 (인증 필요) */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
      </Routes>

      {/* 전역 로그인/회원가입 모달 */}
      <AuthModal open={isOpen} onOpenChange={closeAuthModal} />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
