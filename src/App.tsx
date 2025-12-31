/**
 * App.tsx
 * React Router + TanStack Query Provider 설정
 */
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// 페이지
import HomePage from '@/pages/HomePage';
import WorkDetailPage from '@/pages/WorkDetailPage';
import ChapterViewerPage from '@/pages/ChapterViewerPage';
import LibraryPage from '@/pages/LibraryPage';

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

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* 공개 페이지 */}
          <Route path="/" element={<HomePage />} />
          <Route path="/works/:id" element={<WorkDetailPage />} />
          <Route path="/chapters/:id" element={<ChapterViewerPage />} />

          {/* 인증 필요 페이지 */}
          <Route path="/library" element={<LibraryPage />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
