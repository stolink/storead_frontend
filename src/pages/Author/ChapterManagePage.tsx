/**
 * 챕터 관리 페이지
 * 작품의 챕터 목록 조회, 수정, 삭제
 * Premium Glassmorphism Design
 */
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { navigateToExternalEditor } from "@/utils/navigation";
import { useWork } from "@/hooks/useWorks";
import { useWorkChapters, useDeleteChapter } from "@/hooks/useChapters";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ChevronLeft,
  Feather,
  BookOpen,
  Calendar,
  Eye,
  Edit3,
  Trash2,
  MoreVertical,
  FileText,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Chapter } from "@/types";

// 애니메이션 variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

export const ChapterManagePage = () => {
  const { workId } = useParams<{ workId: string }>();
  const navigate = useNavigate();
  const { data: work, isLoading: workLoading } = useWork(workId || "");
  const { data: chapters, isLoading: chaptersLoading } = useWorkChapters(
    workId || ""
  );
  const deleteChapter = useDeleteChapter();

  const [deleteTarget, setDeleteTarget] = useState<Chapter | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!deleteTarget || !workId) return;
    setDeleteError(null);

    try {
      await deleteChapter.mutateAsync({
        chapterId: deleteTarget.id,
        workId: workId,
      });
      setDeleteTarget(null);
    } catch (err) {
      console.error("챕터 삭제 실패:", err);
      setDeleteError("챕터 삭제에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const handleCloseModal = () => {
    setDeleteTarget(null);
    setDeleteError(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const sortedChapters = [...(chapters || [])].sort(
    (a, b) => a.chapterNumber - b.chapterNumber
  );

  // 통계 계산
  const totalViews =
    chapters?.reduce((sum, chapter) => sum + (chapter.viewCount || 0), 0) || 0;

  if (workLoading || chaptersLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper">
        <div className="relative">
          <div className="w-14 h-14 rounded-full border-4 border-mocha-200 border-t-mocha-500 animate-spin" />
          <div className="absolute inset-0 rounded-full blur-lg bg-mocha-500/20 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!work) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper">
        <div className="text-center glass-card p-8 rounded-2xl max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-espresso-900 font-medium">
            작품을 찾을 수 없습니다.
          </p>
          <Button
            onClick={() => navigate("/author")}
            className="mt-4 bg-mocha-500 hover:bg-mocha-600 text-white"
          >
            작품 목록으로
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper relative overflow-hidden">
      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-mocha-200/30 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-sage-200/20 blur-[100px]" />
      </div>

      {/* Header - Premium Glass */}
      <header className="sticky top-0 z-40 glass-warm border-b border-mocha-200/30">
        <div className="max-w-5xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-5">
              <button
                onClick={() => navigate("/author")}
                className="p-2.5 rounded-xl bg-white/50 hover:bg-white/80 border border-mocha-200/30 transition-all duration-300 hover:scale-105 hover:shadow-lg group"
              >
                <ChevronLeft className="h-5 w-5 text-mocha-600 group-hover:text-mocha-800" />
              </button>

              <div>
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 mb-1"
                >
                  <span className="px-2.5 py-0.5 rounded-full bg-mocha-500/10 text-mocha-600 text-[10px] font-bold uppercase tracking-wider border border-mocha-500/10">
                    Chapter Manager
                  </span>
                </motion.div>
                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-xl font-bold text-espresso-900 tracking-tight"
                >
                  {work.title}
                </motion.h1>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Button
                onClick={() => navigateToExternalEditor(work.projectId)}
                className="bg-espresso-900 hover:bg-mocha-900 text-white rounded-xl px-5 h-11 font-medium shadow-lg shadow-espresso-900/20 hover:shadow-xl hover:shadow-espresso-900/30 transition-all hover:-translate-y-0.5 flex items-center gap-2"
              >
                <Feather className="w-4 h-4" />새 챕터 작성
              </Button>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Quick Stats Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="max-w-5xl mx-auto px-6 py-6"
      >
        <div className="flex items-center gap-4 overflow-x-auto pb-2 no-scrollbar">
          <div className="flex items-center gap-3 px-5 py-3 glass-card rounded-2xl border border-white/40 min-w-fit">
            <div className="w-10 h-10 rounded-xl bg-mocha-500/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-mocha-600" />
            </div>
            <div>
              <p className="text-xs text-mocha-500 font-medium">발행된 챕터</p>
              <p className="text-xl font-bold text-espresso-900">
                {chapters?.length || 0}화
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 px-5 py-3 glass-card rounded-2xl border border-white/40 min-w-fit">
            <div className="w-10 h-10 rounded-xl bg-sage-500/10 flex items-center justify-center">
              <Eye className="w-5 h-5 text-sage-600" />
            </div>
            <div>
              <p className="text-xs text-mocha-500 font-medium">총 조회수</p>
              <p className="text-xl font-bold text-espresso-900">
                {totalViews.toLocaleString()}
              </p>
            </div>
          </div>
          {work.ratingCount > 0 && (
            <div className="flex items-center gap-3 px-5 py-3 glass-card rounded-2xl border border-white/40 min-w-fit">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-mocha-500 font-medium">평균 평점</p>
                <p className="text-xl font-bold text-espresso-900">
                  {(work.ratingSum / work.ratingCount).toFixed(1)}
                </p>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 pb-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {sortedChapters.length > 0 ? (
            <div className="glass-card rounded-2xl border border-white/40 overflow-hidden">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-white/30 border-b border-mocha-200/20 text-xs font-semibold text-mocha-500 uppercase tracking-wider">
                <div className="col-span-1 text-center">번호</div>
                <div className="col-span-6">제목</div>
                <div className="col-span-2 text-center">등록일</div>
                <div className="col-span-2 text-center">조회수</div>
                <div className="col-span-1 text-center">작업</div>
              </div>

              {/* Table Body */}
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {sortedChapters.map((chapter, idx) => (
                  <motion.div
                    key={chapter.id}
                    variants={itemVariants}
                    className={cn(
                      "grid grid-cols-12 gap-4 px-6 py-4 items-center group hover:bg-white/50 transition-all duration-300",
                      idx !== sortedChapters.length - 1 &&
                        "border-b border-mocha-100/50"
                    )}
                  >
                    {/* Chapter Number */}
                    <div className="col-span-1 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-mocha-100/50 text-mocha-600 font-bold text-sm">
                        {chapter.chapterNumber}
                      </span>
                    </div>

                    {/* Title */}
                    <div className="col-span-6">
                      <button
                        onClick={() => navigate(`/chapters/${chapter.id}`)}
                        className="text-left group/title"
                      >
                        <p className="font-medium text-espresso-900 group-hover/title:text-mocha-600 transition-colors line-clamp-1">
                          {chapter.title}
                        </p>
                        {chapter.accessType === "PAID" && (
                          <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                            <Sparkles className="w-3 h-3" />
                            유료
                          </span>
                        )}
                      </button>
                    </div>

                    {/* Date */}
                    <div className="col-span-2 text-center">
                      <span className="text-sm text-mocha-500 flex items-center justify-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(chapter.createdAt)}
                      </span>
                    </div>

                    {/* Views */}
                    <div className="col-span-2 text-center">
                      <span className="text-sm text-mocha-500 flex items-center justify-center gap-1.5">
                        <Eye className="w-3.5 h-3.5" />
                        {(chapter.viewCount || 0).toLocaleString()}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="col-span-1 flex justify-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-2 rounded-lg hover:bg-mocha-100/50 text-mocha-400 hover:text-mocha-600 transition-colors opacity-0 group-hover:opacity-100">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="w-48 glass-card border border-white/40 rounded-xl shadow-2xl"
                        >
                          <DropdownMenuItem
                            onClick={() => navigate(`/chapters/${chapter.id}`)}
                            className="flex items-center gap-2 rounded-lg cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                            뷰어에서 보기
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              navigateToExternalEditor(
                                work.projectId,
                                chapter.documentId
                              )
                            }
                            className="flex items-center gap-2 rounded-lg cursor-pointer"
                          >
                            <Edit3 className="w-4 h-4" />
                            에디터에서 수정
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => setDeleteTarget(chapter)}
                            className="flex items-center gap-2 rounded-lg cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                            챕터 삭제
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          ) : (
            /* Empty State */
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-24 glass-card rounded-3xl border border-white/40"
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="w-24 h-24 bg-gradient-to-tr from-mocha-100 to-mocha-50 rounded-full flex items-center justify-center mb-6 shadow-xl"
              >
                <Feather className="h-10 w-10 text-mocha-500" />
              </motion.div>
              <h2 className="text-2xl font-bold text-espresso-900 mb-3">
                첫 번째 챕터를 작성해보세요
              </h2>
              <p className="text-mocha-500 mb-8 text-center max-w-sm leading-relaxed">
                이야기의 시작은 언제나 설렘으로 가득합니다.
                <br />
                독자들이 기다리고 있어요.
              </p>
              <Button
                onClick={() => navigateToExternalEditor(work.projectId)}
                className="bg-espresso-900 hover:bg-mocha-900 text-white rounded-xl px-8 h-12 font-medium shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 flex items-center gap-2"
              >
                <Feather className="w-4 h-4" />
                첫 챕터 작성하기
              </Button>
            </motion.div>
          )}
        </motion.div>
      </main>

      {/* Delete Confirmation Modal */}
      <AlertDialog open={!!deleteTarget} onOpenChange={handleCloseModal}>
        <AlertDialogContent className="glass-card border border-white/40 rounded-2xl max-w-md">
          <AlertDialogHeader>
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-7 h-7 text-red-500" />
            </div>
            <AlertDialogTitle className="text-center text-xl">
              챕터를 삭제하시겠습니까?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center leading-relaxed">
              <span className="font-semibold text-espresso-900">
                "{deleteTarget?.title}"
              </span>
              <br />
              챕터가 영구적으로 삭제됩니다.
              <br />이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteError && (
            <div className="text-sm text-red-600 bg-red-50 p-4 rounded-xl text-center">
              {deleteError}
            </div>
          )}
          <AlertDialogFooter className="flex gap-3 sm:gap-3">
            <AlertDialogCancel
              disabled={deleteChapter.isPending}
              className="flex-1 rounded-xl h-11 font-medium"
            >
              취소
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteChapter.isPending}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-xl h-11 font-medium disabled:opacity-50"
            >
              {deleteChapter.isPending ? "삭제 중..." : "삭제"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ChapterManagePage;
