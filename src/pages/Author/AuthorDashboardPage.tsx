/**
 * 작가 대시보드 페이지
 * 내 작품 목록 관리 (조회, 수정, 삭제)
 * Premium Glassmorphism Design
 */
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  motion,
  AnimatePresence,
  useSpring,
  useTransform,
} from "framer-motion";
import { navigateToExternalEditor } from "@/utils/navigation";
import { useMyWorks } from "@/hooks/useExportChapter";
import { useDeleteWork, useUpdateWork } from "@/hooks/useWorks";
import {
  ChevronLeft,
  BarChart3,
  Users,
  TrendingUp,
  PieChart,
  Feather,
  BookOpen,
  Sparkles,
  MoreVertical,
  Trash2,
  Edit3,
  Eye,
  ExternalLink,
  Type,
  ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSubContent,
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
import { cn } from "@/lib/utils";
import type { Work } from "@/types";

// 장르 한글 매핑
const GENRE_LABELS: Record<string, string> = {
  FANTASY: "판타지",
  ROMANCE: "로맨스",
  MARTIAL_ARTS: "무협",
  THRILLER: "스릴러",
  SF: "SF",
  DRAMA: "드라마",
};

// 상태 한글 매핑
const STATUS_LABELS: Record<string, string> = {
  ONGOING: "연재중",
  HIATUS: "휴재",
  COMPLETED: "완결",
  DRAFT: "임시저장",
};

// 상태 색상 매핑 - Warm palette
const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string }> =
  {
    ONGOING: { bg: "", text: "text-emerald-700", dot: "bg-emerald-500" },
    HIATUS: { bg: "", text: "text-amber-700", dot: "bg-amber-600" },
    COMPLETED: {
      bg: "",
      text: "text-mocha-800",
      dot: "bg-mocha-700",
    },
    DRAFT: { bg: "", text: "text-zinc-700", dot: "bg-zinc-600" },
  };

// 애니메이션 variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

const cardHoverVariants = {
  rest: { scale: 1 },
  hover: {
    scale: 1.02,
    transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
  },
};

const AnimatedCounter = ({ value }: { value: number }) => {
  const spring = useSpring(0, { bounce: 0, duration: 2000 });
  const display = useTransform(spring, (current) =>
    Math.round(current).toLocaleString(),
  );

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  return <motion.span>{display}</motion.span>;
};

export const AuthorDashboardPage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: works, isLoading, error } = useMyWorks();
  const deleteWork = useDeleteWork();
  const updateWork = useUpdateWork();

  const [activeTab, setActiveTab] = useState<"works" | "insights">("works");
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "ONGOING" | "HIATUS" | "COMPLETED"
  >("ALL");

  const [deleteTarget, setDeleteTarget] = useState<Work | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // 이름 변경 상태
  const [editTitleTarget, setEditTitleTarget] = useState<Work | null>(null);
  const [newTitle, setNewTitle] = useState<string>("");
  const [titleError, setTitleError] = useState<string | null>(null);

  // 표지 변경 상태
  const [editCoverTarget, setEditCoverTarget] = useState<Work | null>(null);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteError(null);

    try {
      await deleteWork.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
    } catch (err) {
      console.error("작품 삭제 실패:", err);
      setDeleteError("작품 삭제에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const handleCloseModal = () => {
    setDeleteTarget(null);
    setDeleteError(null);
  };

  // 이름 변경 핸들러
  const handleTitleEdit = async () => {
    if (!editTitleTarget || !newTitle.trim()) return;
    setTitleError(null);

    try {
      await updateWork.mutateAsync({
        workId: editTitleTarget.id,
        params: { title: newTitle.trim() },
      });
      setEditTitleTarget(null);
      setNewTitle("");
    } catch (err) {
      console.error("작품 이름 변경 실패:", err);
      setTitleError("이름 변경에 실패했습니다. 다시 시도해주세요.");
    }
  };

  // 표지 변경 핸들러 (서버 전송)
  const handleCoverUpload = async (workId: string, file: File) => {
    try {
      // 1. 파일 업로드 (multipart/form-data)
      const { url } = await upload.mutateAsync({ file, type: UPLOAD_TYPES.COVER });

      // 2. 업로드된 URL로 작품 정보 업데이트
      // URL에 쿼리 파라미터를 붙여 브라우저 캐시 방지 (필요 시)
      const urlWithCacheBust = `${url}${url.includes("?") ? "&" : "?"}t=${Date.now()}`;

      await updateWork.mutateAsync({
        workId,
        params: { coverImageUrl: urlWithCacheBust },
      });
    } catch (err) {
      console.error("표지 변경 실패:", err);
    } finally {
      setEditCoverTarget(null);
    }
  };

  // 이미지 선택 시 호출되는 핸들러
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editCoverTarget) {
      setEditCoverTarget(null);
      return;
    }

    // 파일을 직접 전달
    handleCoverUpload(editCoverTarget.id, file);

    // 같은 파일을 다시 선택할 수 있도록 초기화
    e.target.value = "";
  };

  // 통계 계산
  const totalChapters =
    works?.reduce((sum, work) => sum + (work.chapterCount || 0), 0) || 0;
  const totalViews =
    works?.reduce((sum, work) => sum + (work.viewCount || 0), 0) || 0;

  const filteredWorks = works?.filter((work) => {
    if (statusFilter === "ALL") return true;
    return work.status === statusFilter;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper">
        <div className="relative">
          <div className="w-14 h-14 rounded-full border-4 border-mocha-200 border-t-mocha-500 animate-spin" />
          <div className="absolute inset-0 rounded-full blur-lg bg-mocha-500/20 animate-pulse" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper">
        <div className="text-center glass-card p-8 rounded-2xl max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-espresso-900 font-medium">
            작품 목록을 불러오는데 실패했습니다.
          </p>
          <Button
            onClick={() => window.location.reload()}
            className="mt-4 bg-mocha-500 hover:bg-mocha-600 text-white"
          >
            다시 시도
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
        <div className="max-w-6xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-5">
              <button
                onClick={() => navigate("/")}
                className="p-2.5 rounded-xl bg-white/50 hover:bg-white/80 border border-mocha-200/30 transition-all duration-300 hover:scale-105 hover:shadow-lg group"
              >
                <ChevronLeft className="h-5 w-5 text-mocha-700 group-hover:text-mocha-900" />
              </button>

              <div>
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 mb-1"
                >
                  <span className="px-2.5 py-0.5 rounded-full bg-mocha-500/10 text-mocha-700 text-[10px] font-bold uppercase tracking-wider border border-mocha-500/10 shadow-sm">
                    {new Date().getHours() < 12
                      ? "Good Morning"
                      : new Date().getHours() < 18
                        ? "Good Afternoon"
                        : "Good Evening"}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-mocha-500/10 text-mocha-700 text-[10px] font-bold uppercase tracking-wider border border-mocha-500/10 shadow-sm">
                    Author Studio
                  </span>
                </motion.div>
                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-2xl font-heading font-bold text-espresso-900 flex items-center gap-2"
                >
                  작가 대시보드
                </motion.h1>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Button
                onClick={() => navigateToExternalEditor()}
                className="bg-espresso-900 hover:bg-mocha-900 text-white rounded-xl px-5 h-11 font-medium shadow-lg shadow-espresso-900/20 hover:shadow-xl hover:shadow-espresso-900/30 transition-all hover:-translate-y-0.5 flex items-center gap-2"
              >
                <Feather className="w-4 h-4" />새 작품 만들기
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
        className="max-w-6xl mx-auto px-6 py-6"
      >
        <div className="flex items-center gap-4 overflow-x-auto pb-2 no-scrollbar">
          <div className="flex items-center gap-3 px-5 py-3 bg-white rounded-2xl border border-mocha-200 shadow-md min-w-fit transition-all duration-300 hover:shadow-lg">
            <div className="w-10 h-10 rounded-xl bg-mocha-500/15 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-mocha-700" />
            </div>
            <div>
              <p className="text-xs text-mocha-700 font-semibold">총 작품</p>
              <p className="text-xl font-bold text-espresso-900">
                <AnimatedCounter value={works?.length || 0} />편
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 px-5 py-3 bg-white rounded-2xl border border-mocha-200 shadow-md min-w-fit transition-all duration-300 hover:shadow-lg">
            <div className="w-10 h-10 rounded-xl bg-sage-500/15 flex items-center justify-center">
              <Edit3 className="w-5 h-5 text-sage-700" />
            </div>
            <div>
              <p className="text-xs text-mocha-700 font-semibold">발행 챕터</p>
              <p className="text-xl font-bold text-espresso-900">
                <AnimatedCounter value={totalChapters} />화
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 px-5 py-3 bg-white rounded-2xl border border-mocha-200 shadow-md min-w-fit transition-all duration-300 hover:shadow-lg">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center">
              <Eye className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <p className="text-xs text-mocha-700 font-semibold">총 조회수</p>
              <p className="text-xl font-bold text-espresso-900">
                <AnimatedCounter value={totalViews} />
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 pb-16 relative z-10">
        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-2 p-1.5 bg-white/60 backdrop-blur-md rounded-2xl border border-mocha-200/50 shadow-sm w-fit mb-8"
        >
          {[
            { key: "works", label: "내 작품 목록", icon: BookOpen },
            { key: "insights", label: "인사이트 리포트", icon: BarChart3 },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as "works" | "insights")}
              className={cn(
                "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300",
                activeTab === tab.key
                  ? "bg-white text-espresso-900 shadow-md"
                  : "text-mocha-700 hover:text-espresso-900 hover:bg-white/50",
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </motion.div>

        <AnimatePresence mode="wait">
          {activeTab === "works" && (
            <motion.div
              key="works"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Status Filter Tabs */}
              <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 no-scrollbar">
                {[
                  { key: "ALL", label: "전체" },
                  { key: "ONGOING", label: "연재중" },
                  { key: "HIATUS", label: "휴재" },
                  { key: "COMPLETED", label: "완결" },
                ].map((filter) => (
                  <button
                    key={filter.key}
                    onClick={() =>
                      setStatusFilter(
                        filter.key as
                          | "ALL"
                          | "ONGOING"
                          | "HIATUS"
                          | "COMPLETED",
                      )
                    }
                    className={cn(
                      "px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap",
                      statusFilter === filter.key
                        ? "bg-espresso-900 text-white shadow-md shadow-espresso-900/20"
                        : "bg-white text-mocha-700 hover:bg-mocha-50 border border-mocha-200/50",
                    )}
                  >
                    {filter.label}
                    <span className="ml-1.5 text-xs opacity-80">
                      {filter.key === "ALL"
                        ? works?.length || 0
                        : works?.filter((w) => w.status === filter.key)
                            .length || 0}
                    </span>
                  </button>
                ))}
              </div>

              {filteredWorks && filteredWorks.length > 0 ? (
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {filteredWorks.map((work) => (
                    <motion.div
                      variants={itemVariants}
                      key={work.id}
                      className="group relative"
                    >
                      <motion.div
                        variants={cardHoverVariants}
                        onClick={() =>
                          navigate(`/author/works/${work.id}/chapters`)
                        }
                        className="group relative overflow-hidden rounded-2xl cursor-pointer glass-card border border-white/40 hover:border-mocha-300/50 transition-all duration-500"
                      >
                        {/* Cover Image */}
                        <div className="aspect-[4/5] relative overflow-hidden">
                          {/* Loading Overlay */}
                          {updateWork.isPending &&
                            updateWork.variables?.workId === work.id && (
                              <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                                <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                              </div>
                            )}

                          {work.coverImageUrl ? (
                            <img
                              src={work.coverImageUrl}
                              alt={work.title}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-mocha-200 via-mocha-300 to-mocha-400 flex items-center justify-center">
                              <span className="text-white/80 text-6xl font-serif font-bold drop-shadow-lg">
                                {work.title.charAt(0)}
                              </span>
                            </div>
                          )}

                          {/* Gradient Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />

                          {/* Status Badge */}
                          <div className="absolute top-4 left-4">
                            <div
                              className={cn(
                                "flex items-center gap-1.5 px-3 py-1.5 rounded-full shadow-md text-xs font-bold border border-black/10 backdrop-blur-sm bg-white/95",
                                STATUS_STYLES[work.status]?.text ||
                                "text-zinc-600",
                              )}
                            >
                              {work.status === "ONGOING" ? (
                                <span className="relative flex h-2 w-2 mr-0.5">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                              ) : (
                                <span
                                  className={cn(
                                    "w-1.5 h-1.5 rounded-full",
                                    STATUS_STYLES[work.status]?.dot ||
                                      "bg-zinc-400",
                                  )}
                                />
                              )}
                              {STATUS_LABELS[work.status] || work.status}
                            </div>
                          </div>

                          {/* Menu Button */}
                          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button
                                  onClick={(e) => e.stopPropagation()}
                                  className="p-2 rounded-xl bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg transition-all"
                                >
                                  <MoreVertical className="w-4 h-4 text-espresso-900" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                align="end"
                                className="w-48 glass-card border border-white/40 rounded-xl shadow-2xl"
                              >
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/works/${work.id}`);
                                  }}
                                  className="flex items-center gap-2 rounded-lg cursor-pointer"
                                >
                                  <Eye className="w-4 h-4" />
                                  작품 페이지 보기
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigateToExternalEditor(work.projectId);
                                  }}
                                  className="flex items-center gap-2 rounded-lg cursor-pointer"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                  에디터에서 열기
                                </DropdownMenuItem>

                                <DropdownMenuSeparator />
                                <DropdownMenuSub>
                                  <DropdownMenuSubTrigger className="flex items-center gap-2 rounded-lg cursor-pointer">
                                    <Sparkles className="w-4 h-4" />
                                    작품 상태 변경
                                  </DropdownMenuSubTrigger>
                                  <DropdownMenuPortal>
                                    <DropdownMenuSubContent className="glass-card border border-white/40 rounded-xl shadow-xl min-w-[140px]">
                                      <DropdownMenuItem
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          updateWork.mutate({
                                            workId: work.id,
                                            params: { status: "ONGOING" },
                                          });
                                        }}
                                        className="flex items-center gap-2 rounded-lg cursor-pointer hover:bg-emerald-50 text-emerald-700 font-medium"
                                      >
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                        연재중
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          updateWork.mutate({
                                            workId: work.id,
                                            params: { status: "HIATUS" },
                                          });
                                        }}
                                        className="flex items-center gap-2 rounded-lg cursor-pointer hover:bg-amber-50 text-amber-700 font-medium"
                                      >
                                        <div className="w-2 h-2 rounded-full bg-amber-500" />
                                        휴재
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          updateWork.mutate({
                                            workId: work.id,
                                            params: { status: "COMPLETED" },
                                          });
                                        }}
                                        className="flex items-center gap-2 rounded-lg cursor-pointer hover:bg-mocha-50 text-mocha-700 font-medium"
                                      >
                                        <div className="w-2 h-2 rounded-full bg-mocha-500" />
                                        완결
                                      </DropdownMenuItem>
                                    </DropdownMenuSubContent>
                                  </DropdownMenuPortal>
                                </DropdownMenuSub>
                                <DropdownMenuSeparator />
                                {/* 이름 변경 */}
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditTitleTarget(work);
                                    setNewTitle(work.title);
                                  }}
                                  className="flex items-center gap-2 rounded-lg cursor-pointer"
                                >
                                  <Type className="w-4 h-4" />
                                  이름 변경
                                </DropdownMenuItem>
                                {/* 표지 변경 */}
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditCoverTarget(work);
                                    fileInputRef.current?.click();
                                  }}
                                  className="flex items-center gap-2 rounded-lg cursor-pointer"
                                >
                                  <ImageIcon className="w-4 h-4" />
                                  표지 변경
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDeleteTarget(work);
                                  }}
                                  className="flex items-center gap-2 rounded-lg cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  작품 삭제
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>

                          {/* Bottom Info Overlay */}
                          <div className="absolute bottom-0 left-0 right-0 p-5">
                            <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 drop-shadow-lg">
                              {work.title}
                            </h3>
                            <div className="flex items-center gap-3 text-white/80 text-xs">
                              <span className="px-2 py-0.5 bg-white/20 backdrop-blur-sm rounded-full">
                                {GENRE_LABELS[work.genre] || work.genre}
                              </span>
                              <span className="flex items-center gap-1">
                                <BookOpen className="w-3 h-3" />
                                {work.chapterCount || 0}화
                              </span>
                              {work.ratingCount > 0 && (
                                <span className="flex items-center gap-1">
                                  <Sparkles className="w-3 h-3 text-amber-400" />
                                  {(work.ratingSum / work.ratingCount).toFixed(
                                    1,
                                  )}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Mini Insights */}
                        <div className="p-4 grid grid-cols-3 gap-3 bg-white/30">
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-1 text-mocha-700 mb-0.5">
                              <Eye className="w-3.5 h-3.5" />
                              <span className="text-[10px] font-semibold uppercase tracking-wide">
                                조회
                              </span>
                            </div>
                            <p className="text-base font-bold text-espresso-900">
                              {(work.viewCount || 0).toLocaleString()}
                            </p>
                          </div>
                          <div className="text-center border-x border-mocha-200/50">
                            <div className="flex items-center justify-center gap-1 text-mocha-700 mb-0.5">
                              <Users className="w-3.5 h-3.5" />
                              <span className="text-[10px] font-semibold uppercase tracking-wide">
                                구독
                              </span>
                            </div>
                            <p className="text-base font-bold text-espresso-900">
                              {(work.subscriberCount || 0).toLocaleString()}
                            </p>
                          </div>
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-1 text-mocha-700 mb-0.5">
                              <TrendingUp className="w-3.5 h-3.5" />
                              <span className="text-[10px] font-semibold uppercase tracking-wide">
                                연독률
                              </span>
                            </div>
                            <p className="text-base font-bold text-sage-700">
                              {work.chapterCount && work.chapterCount > 1
                                ? `${Math.min(95, 60 + (work.id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % 30))}%`
                                : "-"}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                /* Empty State */
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-24 glass-card rounded-3xl border border-white/40"
                >
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="w-24 h-24 bg-gradient-to-tr from-mocha-100 to-mocha-50 rounded-full flex items-center justify-center mb-6 shadow-xl"
                  >
                    <Feather className="h-10 w-10 text-mocha-700" />
                  </motion.div>
                  <h2 className="text-2xl font-bold text-espresso-900 mb-3">
                    당신의 첫 번째 이야기를 시작하세요
                  </h2>
                  <p className="text-mocha-700 mb-8 text-center max-w-sm leading-relaxed">
                    마음속에 품어온 이야기가 있다면,
                    <br />
                    지금 바로 세상에 펼쳐보세요.
                  </p>
                  <Button
                    onClick={() => navigateToExternalEditor()}
                    className="bg-espresso-900 hover:bg-mocha-900 text-white rounded-xl px-8 h-12 font-medium shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 flex items-center gap-2"
                  >
                    <Feather className="w-4 h-4" />첫 번째 작품 만들기
                  </Button>
                </motion.div>
              )}
            </motion.div>
          )}

          {activeTab === "insights" && (
            <motion.div
              key="insights"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              {/* Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {[
                  {
                    icon: Users,
                    label: "누적 독자수",
                    value: "1,284명",
                    change: "+12%",
                    positive: true,
                    sublabel: "지난주 대비",
                  },
                  {
                    icon: TrendingUp,
                    label: "평균 연독률",
                    value: "68.5%",
                    sublabel: "1화 → 2화 기준",
                  },
                  {
                    icon: BarChart3,
                    label: "오늘 신규 유입",
                    value: "42명",
                    change: "+8%",
                    positive: true,
                    sublabel: "어제 대비",
                  },
                ].map((stat, idx) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="glass-card rounded-2xl p-6 border border-mocha-200/50 hover:border-mocha-300 transition-all duration-300 group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className={cn(
                          "w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110",
                          idx === 0
                            ? "bg-mocha-500/15"
                            : idx === 1
                              ? "bg-sage-500/15"
                              : "bg-amber-500/15",
                        )}
                      >
                        <stat.icon
                          className={cn(
                            "w-5 h-5",
                            idx === 0
                              ? "text-mocha-700"
                              : idx === 1
                                ? "text-sage-700"
                                : "text-amber-700",
                          )}
                        />
                      </div>
                      {stat.change && (
                        <span
                          className={cn(
                            "text-xs font-bold px-2.5 py-1 rounded-full",
                            stat.positive
                              ? "bg-sage-100 text-sage-700"
                              : "bg-red-100 text-red-700",
                          )}
                        >
                          {stat.change}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-mocha-800 font-bold mb-1">
                      {stat.label}
                    </p>
                    <p className="text-3xl font-black text-espresso-900 mb-1">
                      {stat.value}
                    </p>
                    <p className="text-xs text-mocha-600 font-medium">
                      {stat.sublabel}
                    </p>
                  </motion.div>
                ))}
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Retention Chart */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="glass-card rounded-2xl p-6 border border-mocha-200/50"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-mocha-500 to-mocha-700 flex items-center justify-center shadow-lg shadow-mocha-500/30">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-espresso-900">
                        챕터별 연독률
                      </h3>
                      <p className="text-xs text-mocha-600 font-semibold">
                        독자들이 어느 챕터까지 읽는지 분석합니다
                      </p>
                    </div>
                  </div>

                  <div className="h-[200px] flex items-end justify-between gap-2 pt-8 px-4">
                    {[100, 92, 85, 78, 72, 68, 65, 62, 60, 58].map((val, i) => (
                      <div
                        key={i}
                        className="flex flex-col items-center gap-2 flex-1 group"
                      >
                        <div className="relative w-full">
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${val * 1.5}px` }}
                            transition={{
                              delay: 0.4 + i * 0.05,
                              duration: 0.6,
                              ease: [0.16, 1, 0.3, 1],
                            }}
                            className="w-full bg-gradient-to-t from-mocha-500 to-mocha-400 rounded-t-md group-hover:from-mocha-600 group-hover:to-mocha-500 transition-all duration-300 cursor-pointer relative"
                          >
                            <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-[10px] font-bold text-espresso-900 opacity-0 group-hover:opacity-100 transition-opacity bg-white px-2 py-0.5 rounded-md shadow-md border border-mocha-200">
                              {val}%
                            </span>
                          </motion.div>
                        </div>
                        <span className="text-[10px] text-mocha-700 font-bold">
                          {i + 1}화
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Discovery Chart */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="glass-card rounded-2xl p-6 border border-white/40"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sage-500 to-sage-600 flex items-center justify-center shadow-lg shadow-sage-500/20">
                      <PieChart className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-espresso-900">
                        유입 경로 분석
                      </h3>
                      <p className="text-xs text-mocha-600 font-semibold">
                        독자들이 작품을 발견한 경로
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row items-center justify-center h-auto md:h-[200px] gap-6 md:gap-10 py-4">
                    {/* Donut Chart */}
                    <div className="relative w-36 h-36 shrink-0">
                      <svg
                        viewBox="0 0 36 36"
                        className="w-full h-full transform -rotate-90"
                      >
                        <circle
                          cx="18"
                          cy="18"
                          r="15.915"
                          fill="none"
                          stroke="hsl(var(--muted))"
                          strokeWidth="3"
                        />
                        <motion.circle
                          cx="18"
                          cy="18"
                          r="15.915"
                          fill="none"
                          stroke="#A47764"
                          strokeWidth="3"
                          strokeDasharray="45 100"
                          initial={{ strokeDashoffset: 100 }}
                          animate={{ strokeDashoffset: 0 }}
                          transition={{ delay: 0.5, duration: 1 }}
                        />
                        <motion.circle
                          cx="18"
                          cy="18"
                          r="15.915"
                          fill="none"
                          stroke="#CBB2A6"
                          strokeWidth="3"
                          strokeDasharray="30 100"
                          strokeDashoffset="-45"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.8 }}
                        />
                        <motion.circle
                          cx="18"
                          cy="18"
                          r="15.915"
                          fill="none"
                          stroke="#EFE8E4"
                          strokeWidth="3"
                          strokeDasharray="25 100"
                          strokeDashoffset="-75"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 1 }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center flex-col">
                        <span className="text-xs text-mocha-600 font-bold">
                          Total
                        </span>
                        <span className="text-xl font-bold text-espresso-900">
                          1.2k
                        </span>
                      </div>
                    </div>

                    {/* Legend */}
                    <div className="space-y-4">
                      {[
                        {
                          color: "bg-mocha-500",
                          label: "추천 섹션",
                          value: "45%",
                        },
                        {
                          color: "bg-mocha-300",
                          label: "키워드 검색",
                          value: "30%",
                        },
                        {
                          color: "bg-mocha-100",
                          label: "랭킹 페이지",
                          value: "25%",
                        },
                      ].map((item, idx) => (
                        <motion.div
                          key={item.label}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.6 + idx * 0.1 }}
                          className="flex items-center gap-3"
                        >
                          <div
                            className={cn("w-3 h-3 rounded-sm", item.color)}
                          />
                          <span className="text-sm text-espresso-900 font-medium">
                            {item.label}
                          </span>
                          <span className="text-sm text-mocha-700 font-black">
                            {item.value}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Delete Confirmation Modal */}
      <AlertDialog open={!!deleteTarget} onOpenChange={handleCloseModal}>
        <AlertDialogContent className="glass-card border border-white/40 rounded-2xl max-w-md">
          <AlertDialogHeader>
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-7 h-7 text-red-500" />
            </div>
            <AlertDialogTitle className="text-center text-xl">
              작품을 삭제하시겠습니까?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center leading-relaxed">
              <span className="font-semibold text-espresso-900">
                "{deleteTarget?.title}"
              </span>
              <br />
              작품과 모든 챕터가 영구적으로 삭제됩니다.
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
              disabled={deleteWork.isPending}
              className="flex-1 rounded-xl h-11 font-medium"
            >
              취소
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={deleteWork.isPending}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-xl h-11 font-medium disabled:opacity-50"
            >
              {deleteWork.isPending ? "삭제 중..." : "삭제"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 이름 변경 모달 */}
      <AlertDialog
        open={!!editTitleTarget}
        onOpenChange={() => {
          setEditTitleTarget(null);
          setNewTitle("");
          setTitleError(null);
        }}
      >
        <AlertDialogContent className="glass-card border border-white/40 rounded-2xl max-w-md">
          <AlertDialogHeader>
            <div className="w-14 h-14 bg-mocha-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Type className="w-7 h-7 text-mocha-600" />
            </div>
            <AlertDialogTitle className="text-center text-xl">
              작품 이름 변경
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center leading-relaxed">
              새로운 작품 이름을 입력해주세요.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="작품 이름"
              className="rounded-xl h-12 text-base px-4"
              autoFocus
            />
          </div>
          {titleError && (
            <div className="text-sm text-red-600 bg-red-50 p-4 rounded-xl text-center">
              {titleError}
            </div>
          )}
          <AlertDialogFooter className="flex gap-3 sm:gap-3">
            <AlertDialogCancel
              disabled={updateWork.isPending}
              className="flex-1 rounded-xl h-11 font-medium"
            >
              취소
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleTitleEdit}
              disabled={updateWork.isPending || !newTitle.trim()}
              className="flex-1 bg-mocha-500 hover:bg-mocha-600 text-white rounded-xl h-11 font-medium disabled:opacity-50"
            >
              {updateWork.isPending ? "변경 중..." : "변경"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>


      {/* Hidden File Input for Cover Upload */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        className="hidden"
        onChange={handleImageUpload}
      />
    </div>
  );
};

export default AuthorDashboardPage;
