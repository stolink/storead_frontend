/**
 * App.tsx
 * React Router + TanStack Query Provider 설정
 */
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// 레이아웃 컴포넌트
import { Layout } from "@/components/layout/Layout";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import ScrollToTop from "@/components/layout/ScrollToTop";

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
import WritersPage from "@/pages/WritersPage";
import RankingPage from "@/pages/RankingPage"; // 랭킹 페이지
import CategoryPage from "@/pages/CategoryPage"; // 카테고리 페이지

// 인증 페이지
import OAuth2Callback from "@/pages/Auth/OAuth2Callback";

// 작가 페이지
import AuthorDashboardPage from "@/pages/Author/AuthorDashboardPage";
import ChapterManagePage from "@/pages/Author/ChapterManagePage";

// 프로필 페이지
import ProfilePage from "@/pages/Profile/ProfilePage";

// 결제 페이지
import { CreditChargePage } from "@/pages/payment/CreditChargePage";
import { PaymentSuccessPage } from "@/pages/payment/PaymentSuccessPage";
import { PaymentFailPage } from "@/pages/payment/PaymentFailPage";

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

import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

function AppContent() {
  const { isOpen, closeAuthModal, openAuthModal } = useAuthModalStore();
  const [searchParams, setSearchParams] = useSearchParams();

  // 401 에러 등으로 인한 auth=required 쿼리 감지 시 모달 자동 표시
  useEffect(() => {
    if (searchParams.get("auth") === "required") {
      openAuthModal();
      // 쿼리 파라미터 제거
      searchParams.delete("auth");
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams, openAuthModal]);

  return (
    <>
      <Routes>
        {/* 공개 페이지 (헤더 포함) */}
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/writers" element={<WritersPage />} />
          <Route path="/works/:id" element={<WorkDetailPage />} />
          <Route path="/ranking" element={<RankingPage />} />
          <Route path="/category/:genreId" element={<CategoryPage />} />
          <Route
            path="/library"
            element={
              <ProtectedRoute>
                <LibraryPage />
              </ProtectedRoute>
            }
          />
          {/* 커뮤니티 배포 - 게시 확인 페이지 (헤더 포함) */}
          <Route path="/write" element={<WritePage />} />
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
          path="/author/works/:workId/chapters"
          element={
            <ProtectedRoute>
              <ChapterManagePage />
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

        {/* 결제 관련 페이지 */}
        <Route
          path="/credits/charge"
          element={
            <ProtectedRoute>
              <CreditChargePage />
            </ProtectedRoute>
          }
        />
        <Route path="/payments/success" element={<PaymentSuccessPage />} />
        <Route path="/payments/fail" element={<PaymentFailPage />} />
      </Routes>

      {/* 전역 로그인/회원가입 모달 */}
      <AuthModal open={isOpen} onOpenChange={closeAuthModal} />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <ScrollToTop />
        <AppContent />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
