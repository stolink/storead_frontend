/**
 * WritePage - 커뮤니티 배포 게시 확인 페이지
 * Stolink에서 리다이렉트되어 Draft 데이터를 확인하고 게시하는 페이지
 *
 * 지원 모드:
 * 1. 단일 Draft (draftId 파라미터): 기존 2단 컬럼 레이아웃
 * 2. 다중 Draft (draftIds 파라미터): 일괄 목록에서 순차 게시
 */
import { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/stores/useAuthStore";
import { useAuthModalStore } from "@/stores/useAuthModalStore";
import {
  useDraft,
  useDrafts,
  useDeleteDraft,
  type Draft,
} from "@/hooks/useDraft";
import { usePublish } from "@/hooks/usePublish";
import { useWorkByProjectId } from "@/hooks/useWorks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { GraphModal } from "@/components/viewer/GraphModal";
import {
  adaptGraphSnapshot,
  type GraphSnapshotDTO,
} from "@/adapters/graphSnapshotAdapter";
import { ChapterSummaryCard } from "@/components/writer/ChapterSummaryCard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertCircle,
  CheckCircle,
  Loader2,
  ImageIcon,
  ChevronRight,
  RotateCcw,
  Filter,
  Pencil,
  Info,
  Upload,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { DraftQuickEditModal } from "@/components/writer/DraftQuickEditModal";
import { useUpdateDraft } from "@/hooks/useDraft";
import type { Genre } from "@/types";

// 장르 옵션 목록
const GENRE_OPTIONS: { value: Genre; label: string }[] = [
  { value: "FANTASY", label: "판타지" },
  { value: "ROMANCE", label: "로맨스" },
  { value: "MARTIAL_ARTS", label: "무협" },
  { value: "THRILLER", label: "스릴러" },
  { value: "SF", label: "SF" },
  { value: "DRAMA", label: "드라마" },
  { value: "HEROIC_FANTASY", label: "영웅 판타지" },
  { value: "DARK_FANTASY", label: "다크 판타지" },
  { value: "URBAN_FANTASY", label: "어반 판타지" },
  { value: "HIGH_FANTASY", label: "하이 판타지" },
  { value: "ISEKAI", label: "이세계" },
  { value: "MODERN_FANTASY", label: "현대 판타지" },
  { value: "TRADITIONAL_FANTASY", label: "전통 판타지" },
  { value: "ROMANCE_FANTASY", label: "로맨스 판타지" },
  { value: "COMEDY", label: "코미디" },
  { value: "HORROR", label: "호러" },
  { value: "OTHER", label: "기타" },
];

// 줄거리 최대 글자 수
const SYNOPSIS_MAX_LENGTH = 2000;

// === 다중 Draft 일괄 게시 컴포넌트 ===
interface BatchPublishViewProps {
  drafts: Draft[];
  onComplete: (workId?: string) => void;
}

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
    },
  },
  hover: {
    y: -2,
    transition: { duration: 0.2 },
  },
};

function BatchPublishView({ drafts, onComplete }: BatchPublishViewProps) {
  const navigate = useNavigate();
  const publishMutation = usePublish();
  const updateDraftMutation = useUpdateDraft();

  // 각 Draft의 게시 상태 관리
  const [publishedIds, setPublishedIds] = useState<Set<string>>(new Set());
  const [errorMessages, setErrorMessages] = useState<Map<string, string>>(
    new Map(),
  );
  const [currentPublishingId, setCurrentPublishingId] = useState<string | null>(
    null,
  );
  const [lastWorkId, setLastWorkId] = useState<string | null>(null);

  // 모든 챕터 게시 완료 시 처리
  useEffect(() => {
    if (publishedIds.size > 0 && publishedIds.size === drafts.length) {
      const timer = setTimeout(() => {
        onComplete(lastWorkId || undefined);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [publishedIds.size, drafts.length, onComplete, lastWorkId]);
  const [showOnlyErrors, setShowOnlyErrors] = useState(false);
  const [editingDraft, setEditingDraft] = useState<Draft | null>(null);

  // 일괄 적용 설정
  const [accessType, setAccessType] = useState<"FREE" | "PAID">("FREE");
  const [price, setPrice] = useState<number>(100);

  // 게시 진행률
  const progress = useMemo(() => {
    return {
      total: drafts.length,
      completed: publishedIds.size,
      failed: errorMessages.size,
      remaining: drafts.length - publishedIds.size - errorMessages.size,
    };
  }, [drafts.length, publishedIds.size, errorMessages.size]);

  // 필터링된 Draft 목록
  const filteredDrafts = useMemo(() => {
    if (showOnlyErrors) {
      return drafts.filter((d) => errorMessages.has(d.id));
    }
    return drafts;
  }, [drafts, showOnlyErrors, errorMessages]);

  // 개별 Draft 게시
  const handlePublishOne = async (draft: Draft) => {
    if (publishedIds.has(draft.id) || currentPublishingId) return;

    setCurrentPublishingId(draft.id);
    setErrorMessages((prev) => {
      const next = new Map(prev);
      next.delete(draft.id);
      return next;
    });

    try {
      const result = await publishMutation.mutateAsync({
        draftId: draft.id,
        title: draft.title || draft.workTitle || "제목 없음",
        accessType,
        price: accessType === "PAID" ? price : 0,
      });
      setPublishedIds((prev) => new Set([...prev, draft.id]));
      if (result.workId) setLastWorkId(result.workId);
    } catch (error: unknown) {
      console.error("게시 실패:", draft.id, error);
      const err = error as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      const msg =
        err?.response?.data?.message || err?.message || "알 수 없는 에러";
      setErrorMessages((prev) => new Map(prev).set(draft.id, msg));
    } finally {
      setCurrentPublishingId(null);
    }
  };

  // 전체 게시 (첫 작품 생성 시 Race Condition 방지)
  const handlePublishAll = async () => {
    const unpublished = drafts.filter(
      (d) => !publishedIds.has(d.id) && !errorMessages.has(d.id),
    );

    if (unpublished.length === 0) return;

    // 첫 번째 Draft 배포 (Work 생성이 필요할 수 있음)
    const firstDraft = unpublished[0];
    setCurrentPublishingId(firstDraft.id);
    setErrorMessages((prev) => {
      const next = new Map(prev);
      next.delete(firstDraft.id);
      return next;
    });

    let isFirstWorkCreated = false;

    try {
      const result = await publishMutation.mutateAsync({
        draftId: firstDraft.id,
        title: firstDraft.title || firstDraft.workTitle || "제목 없음",
        accessType,
        price: accessType === "PAID" ? price : 0,
      });
      setPublishedIds((prev) => new Set([...prev, firstDraft.id]));
      isFirstWorkCreated = result.workCreated;
      if (result.workId) setLastWorkId(result.workId);
    } catch (error: unknown) {
      console.error("첫 번째 게시 실패:", firstDraft.id, error);
      const err = error as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      const msg =
        err?.response?.data?.message || err?.message || "알 수 없는 에러";
      setErrorMessages((prev) => new Map(prev).set(firstDraft.id, msg));
      setCurrentPublishingId(null);
      return; // 첫 번째 실패 시 중단
    }

    setCurrentPublishingId(null);

    // 첫 번째 배포가 Work 생성을 포함한 경우,
    // 백엔드 트랜잭션 커밋 완료를 위한 대기 시간 추가
    if (isFirstWorkCreated) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    // 나머지 Draft들은 순차 처리
    for (const draft of unpublished.slice(1)) {
      await handlePublishOne(draft);
    }
  };

  // 취소 핸들러
  const handleCancel = () => {
    navigate("/");
  };

  // Draft 수정 저장 핸들러
  const handleEditSave = async (updatedDraft: Partial<Draft>) => {
    if (!editingDraft) return;
    try {
      await updateDraftMutation.mutateAsync({
        draftId: editingDraft.id,
        updates: {
          title: updatedDraft.title,
          content: updatedDraft.content,
        },
      });
      setEditingDraft(null);
    } catch (error) {
      console.error("Draft 수정 실패:", error);
    }
  };

  return (
    <div className="min-h-screen bg-paper relative overflow-hidden">
      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-mocha-200/30 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-sage-200/20 blur-[100px]" />
      </div>

      <div className="py-12 max-w-4xl mx-auto relative z-10 px-6">
        {/* 페이지 헤더 */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold font-heading text-foreground">
            챕터 일괄 게시
          </h1>
          <p className="text-muted-foreground mt-1">
            Stolink에서 전달된 챕터들을 확인하고 일괄 게시하세요.
          </p>
        </div>

        {/* 진행 상황 Card (Glass) */}
        <div className="glass-card p-6 rounded-2xl border border-mocha-200/50 mb-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-mocha-100/30" />
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-mocha-500 to-mocha-600 flex items-center justify-center shadow-lg shadow-mocha-500/20">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-bold text-lg text-espresso-900">
                  게시 진행 상황
                </p>
                <p className="text-sm text-mocha-600 font-medium">
                  총 {progress.total}개 중 {progress.completed}개 완료
                  {progress.failed > 0 && (
                    <span className="text-red-500 ml-2 font-bold animate-pulse">
                      ({progress.failed}개 실패)
                    </span>
                  )}
                </p>
              </div>
            </div>
            <span className="text-3xl font-black text-mocha-200 tabular-nums">
              {Math.round((progress.completed / progress.total) * 100)}%
            </span>
          </div>
          {/* 진행률 바 (Enhanced) */}
          <div className="w-full h-3 bg-mocha-900/5 rounded-full overflow-hidden p-[2px]">
            <motion.div
              className="h-full bg-gradient-to-r from-mocha-400 to-mocha-600 rounded-full shadow-sm"
              initial={{ width: 0 }}
              animate={{
                width: `${(progress.completed / progress.total) * 100}%`,
              }}
              transition={{ type: "spring", stiffness: 50, damping: 15 }}
            />
          </div>
        </div>

        {/* 일괄 설정 및 필터 (Glass) */}
        <div className="glass-card p-6 rounded-2xl border border-mocha-200/50 mb-8 space-y-5">
          <h3 className="font-bold text-espresso-900 flex items-center gap-2 text-lg">
            <div className="p-1.5 bg-mocha-100/50 rounded-lg">
              <Pencil className="w-4 h-4 text-mocha-600" />
            </div>
            발행 설정 (일괄 적용)
          </h3>
          <div className="flex flex-wrap gap-8 items-center pl-1">
            {/* 접근 권한 선택 UI Upgrade */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-mocha-400 uppercase tracking-wider block">
                접근 권한
              </span>
              <div className="flex bg-mocha-900/5 p-1 rounded-xl">
                <button
                  onClick={() => setAccessType("FREE")}
                  className={`px-5 py-2 text-sm font-bold rounded-lg transition-all duration-300 ${
                    accessType === "FREE"
                      ? "bg-white text-emerald-600 shadow-md transform scale-105"
                      : "text-mocha-400 hover:text-mocha-600"
                  }`}
                >
                  무료
                </button>
                <button
                  onClick={() => setAccessType("PAID")}
                  className={`px-5 py-2 text-sm font-bold rounded-lg transition-all duration-300 ${
                    accessType === "PAID"
                      ? "bg-white text-mocha-600 shadow-md transform scale-105"
                      : "text-mocha-400 hover:text-mocha-600"
                  }`}
                >
                  유료
                </button>
              </div>
            </div>

            {/* 가격 설정 (유료일 때만) */}
            <AnimatePresence>
              {accessType === "PAID" && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-2"
                >
                  <span className="text-xs font-bold text-mocha-400 uppercase tracking-wider block">
                    가격 (크레딧)
                  </span>
                  <div className="relative w-32 group">
                    <Input
                      type="number"
                      min={0}
                      step={100}
                      value={price}
                      onChange={(e) => setPrice(Number(e.target.value))}
                      className="pr-10 text-right h-10 bg-white/50 border-mocha-200 focus:bg-white focus:border-mocha-400 font-bold text-lg text-espresso-900 transition-all"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-mocha-400 font-bold group-focus-within:text-mocha-600 transition-colors">
                      C
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* 목록 헤더 & 필터 */}
        <div className="flex items-center justify-between mb-6 px-1">
          <h2 className="text-xl font-bold text-espresso-900 flex items-center gap-2">
            게시 항목 리스트
            <span className="px-2 py-0.5 rounded-full bg-mocha-100 text-mocha-700 text-xs font-bold border border-mocha-200">
              {filteredDrafts.length}
            </span>
          </h2>
          <Button
            variant="outline"
            size="sm"
            className={`h-9 gap-2 rounded-lg border-mocha-200 hover:bg-mocha-50 ${showOnlyErrors ? "text-red-500 border-red-200 bg-red-50 hover:bg-red-100" : "text-mocha-600"}`}
            onClick={() => setShowOnlyErrors(!showOnlyErrors)}
          >
            <Filter className="w-3.5 h-3.5" />
            {showOnlyErrors ? "전체 보기" : "실패 항목만 보기"}
          </Button>
        </div>

        {/* Draft 목록 (Staggered Animation) */}
        <motion.div
          className="space-y-4 mb-12"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <AnimatePresence>
            {filteredDrafts.map((draft, index) => {
              const isPublished = publishedIds.has(draft.id);
              const errorMessage = errorMessages.get(draft.id);
              const isPublishing = currentPublishingId === draft.id;

              return (
                <motion.div
                  layout
                  variants={itemVariants}
                  whileHover="hover"
                  key={draft.id}
                  className={`flex flex-col p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden group ${
                    isPublished
                      ? "bg-emerald-50/80 border-emerald-200/60"
                      : errorMessage
                        ? "bg-red-50/80 border-red-200/60 shadow-red-100"
                        : isPublishing
                          ? "bg-white border-mocha-400 ring-2 ring-mocha-100 shadow-lg"
                          : "bg-white/80 border-white/40 hover:border-mocha-300 hover:bg-white hover:shadow-lg hover:shadow-mocha-900/5 backdrop-blur-sm"
                  }`}
                >
                  {isPublishing && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                      animate={{ x: ["-100%", "100%"] }}
                      transition={{
                        repeat: Infinity,
                        duration: 1.5,
                        ease: "linear",
                      }}
                    />
                  )}

                  <div className="flex items-center gap-5 relative z-10">
                    {/* 순서 번호 */}
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shadow-sm flex-shrink-0 transition-colors duration-300 ${
                        isPublished
                          ? "bg-emerald-500 text-white shadow-emerald-200"
                          : errorMessage
                            ? "bg-red-500 text-white shadow-red-200"
                            : "bg-mocha-100 text-mocha-600 group-hover:bg-mocha-500 group-hover:text-white"
                      }`}
                    >
                      {isPublished ? (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring" }}
                        >
                          <CheckCircle className="w-5 h-5" />
                        </motion.div>
                      ) : errorMessage ? (
                        <AlertCircle className="w-5 h-5" />
                      ) : (
                        index + 1
                      )}
                    </div>

                    {/* 정보 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2.5 mb-1">
                        <p
                          className={`font-bold text-lg truncate transition-colors ${isPublished ? "text-emerald-800" : "text-espresso-900"}`}
                        >
                          {draft.title || "제목 없음"}
                        </p>
                        {!isPublished && !isPublishing && (
                          <button
                            onClick={() => setEditingDraft(draft)}
                            className="p-1.5 rounded-full bg-mocha-50 text-mocha-400 opacity-0 group-hover:opacity-100 hover:bg-mocha-500 hover:text-white transition-all scale-90 hover:scale-100"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <p className="text-sm text-mocha-600/80 line-clamp-1 font-medium">
                        {draft.content?.replace(/<[^>]*>/g, "").slice(0, 80) ||
                          "내용 없음"}
                      </p>
                    </div>

                    {/* 상태/액션 */}
                    <div className="flex items-center gap-3 ml-4">
                      {isPublished ? (
                        <span className="text-sm text-emerald-600 font-bold px-4 py-1.5 bg-white/80 rounded-full border border-emerald-100 shadow-sm flex items-center gap-1.5">
                          <CheckCircle className="w-4 h-4" /> 완료
                        </span>
                      ) : errorMessage ? (
                        <Button
                          size="sm"
                          className="bg-red-500 hover:bg-red-600 text-white h-9 px-4 rounded-lg font-bold shadow-md shadow-red-200"
                          onClick={() => handlePublishOne(draft)}
                        >
                          <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                          재시도
                        </Button>
                      ) : isPublishing ? (
                        <div className="flex items-center gap-2 text-mocha-600 font-bold text-sm bg-mocha-50 px-4 py-1.5 rounded-full">
                          <Loader2 className="w-4 h-4 animate-spin text-mocha-500" />
                          게시 중...
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          className="h-9 px-5 bg-white border border-mocha-200 text-mocha-600 font-bold hover:bg-mocha-500 hover:text-white hover:border-mocha-500 transition-all shadow-sm rounded-lg group-hover:shadow-md"
                          onClick={() => handlePublishOne(draft)}
                          disabled={!!currentPublishingId}
                        >
                          게시
                          <ChevronRight className="w-4 h-4 ml-1 opacity-60 group-hover:opacity-100" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* 실패 사유 노출 */}
                  {errorMessage && (
                    <div className="mt-4 ml-14 flex items-start gap-2.5 p-3 bg-white/60 rounded-xl border border-red-100/50 text-xs font-medium text-red-600 animate-in slide-in-from-top-2">
                      <div className="p-1 bg-red-100 rounded-full">
                        <Info className="w-3 h-3 text-red-500" />
                      </div>
                      <p className="mt-0.5">{errorMessage}</p>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
        {filteredDrafts.length === 0 && showOnlyErrors && (
          <div className="py-12 text-center bg-gray-50 rounded-xl border border-dashed text-muted-foreground">
            실패한 항목이 없습니다.
          </div>
        )}
      </div>

      {/* 액션 버튼 (Floating Glass Bar) */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-3xl px-6 z-50">
        <div className="glass-card-elevated p-3 pl-4 rounded-2xl flex justify-between items-center shadow-xl shadow-mocha-900/10 border border-white/40">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                className="text-muted-foreground hover:text-red-500 hover:bg-red-50"
                disabled={!!currentPublishingId}
              >
                작업 취소
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>게시를 취소하시겠습니까?</AlertDialogTitle>
                <AlertDialogDescription>
                  작성 중인 데이터와 대기 중인 항목들이 사라집니다. 정말
                  취소하시겠습니까?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>계속 진행</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleCancel}
                  className="bg-red-500 hover:bg-red-600"
                >
                  네, 취소합니다
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Button
            className="bg-mocha-500 hover:bg-mocha-600 text-paper px-8 h-11 font-bold shadow-md"
            onClick={handlePublishAll}
            disabled={!!currentPublishingId || progress.remaining === 0}
          >
            {currentPublishingId ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                게시 진행 중...
              </>
            ) : progress.remaining === 0 ? (
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4" />
                게시 완료
              </div>
            ) : (
              <>
                전체 게시 ({progress.remaining}개)
                <ChevronRight className="w-4 h-4 ml-1" />
              </>
            )}
          </Button>
        </div>
      </div>

      {/* 퀵 에디트 모달 */}
      <DraftQuickEditModal
        isOpen={!!editingDraft}
        onClose={() => setEditingDraft(null)}
        draft={editingDraft}
        onSave={handleEditSave}
      />
    </div>
  );
}

// === 단일 Draft 게시 컴포넌트 (기존 UI) ===
interface SinglePublishViewProps {
  draft: Draft;
  draftId: string;
  allDrafts?: Draft[];
  isBatchMode?: boolean;
}

function SinglePublishView({
  draft,
  draftId,
  allDrafts = [],
  isBatchMode = false,
}: SinglePublishViewProps) {
  const navigate = useNavigate();

  // [IMAGE UPLOAD] Handle local file to Base64 conversion
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setCoverUrl(base64);
    };
    reader.readAsDataURL(file);
  };

  // [FIX] Render phase reset to avoid useEffect cascading
  const [prevDraftId, setPrevDraftId] = useState(draft?.id);
  const [coverUrl, setCoverUrl] = useState(draft?.workCoverUrl || "");
  const [genre, setGenre] = useState<Genre>(() => {
    if (draft?.workGenre) {
      const validGenre = GENRE_OPTIONS.find(
        (opt) => opt.value === draft.workGenre,
      );
      return validGenre ? validGenre.value : "OTHER";
    }
    return "OTHER";
  });
  const [synopsis, setSynopsis] = useState(() => {
    if (draft?.workSynopsis) return draft.workSynopsis;
    if (draft?.content)
      return draft.content.replace(/<[^>]*>/g, "").slice(0, 500);
    return "";
  });

  if (draft?.id !== prevDraftId) {
    setPrevDraftId(draft?.id);
    setCoverUrl(draft?.workCoverUrl || "");
    if (draft?.workGenre) {
      const validGenre = GENRE_OPTIONS.find((o) => o.value === draft.workGenre);
      if (validGenre) setGenre(validGenre.value);
    }
    if (draft?.workSynopsis) {
      setSynopsis(draft.workSynopsis);
    } else if (draft?.content) {
      setSynopsis(draft.content.replace(/<[^>]*>/g, "").slice(0, 500));
    }
  }

  const [showGraphModal, setShowGraphModal] = useState(false);
  const [accessType, setAccessType] = useState<"FREE" | "PAID">("FREE");
  const [workAccessType, setWorkAccessType] = useState<"FREE" | "PAID">("FREE");
  const [price, setPrice] = useState<number>(100);

  // 작품 정보는 상위 WritePage에서 제공받거나 필요시 내부에서 조회 (현재는 상위에서 로딩 처리)
  const { data: workData, isLoading: isWorkLoading } = useWorkByProjectId(
    draft?.projectId || null,
  );
  const existingWork = (workData as { works?: { title?: string }[] })
    ?.works?.[0];

  // 게시/취소 mutation
  const publishMutation = usePublish();
  const deleteDraftMutation = useDeleteDraft();

  // 게시하기 핸들러
  const handlePublish = async () => {
    try {
      const result = await publishMutation.mutateAsync({
        draftId,
        title: draft?.title || draft?.workTitle || "제목 없음",
        accessType,
        price: accessType === "PAID" ? price : 0,
        workAccessType: !existingWork ? workAccessType : undefined,
      });
      // 1.5초 후 이동
      setTimeout(() => {
        navigate(`/chapters/${result.chapterId}`);
      }, 1500);
    } catch (error) {
      console.error("게시 실패:", error);
    }
  };

  // 취소 핸들러
  const handleCancel = async () => {
    try {
      await deleteDraftMutation.mutateAsync(draftId);
    } catch (error) {
      console.error("Draft 삭제 실패:", error);
    }
    navigate("/");
  };

  // 표지 이미지 에러 핸들러
  const handleImageError = (
    e: React.SyntheticEvent<HTMLImageElement, Event>,
  ) => {
    e.currentTarget.style.display = "none";
  };

  return (
    <div className="py-8 px-4 md:px-6 w-full max-w-6xl mx-auto">
      {/* 페이지 헤더 */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold font-heading text-foreground">
          작품 게시
        </h1>
        <p className="text-muted-foreground mt-1">
          Stolink에서 전달된 콘텐츠를 확인하고 게시하세요.
        </p>
      </div>

      {/* 2단 컬럼 그리드 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 좌측 컬럼: 표지 이미지 */}
        <div className="lg:col-span-1 space-y-4">
          {/* 표지 미리보기 */}
          {/* 표지 미리보기 */}
          {/* 표지 미리보기 (3D Effect) */}
          <div className="aspect-[3/4] bg-muted rounded-xl overflow-hidden border border-white/20 relative shadow-2xl transform hover:scale-[1.02] transition-transform duration-500 perspective-1000 group">
            <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent z-10 pointer-events-none mix-blend-multiply" />
            <div className="absolute left-0 top-0 bottom-0 w-[2%] bg-gradient-to-r from-white/40 to-transparent z-20 pointer-events-none" />
            {coverUrl ? (
              <img
                src={coverUrl}
                alt="표지 미리보기"
                className="w-full h-full object-cover shadow-inner"
                onError={handleImageError}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground bg-gradient-to-br from-gray-100 to-gray-200">
                <ImageIcon className="w-16 h-16 mb-4 text-gray-300" />
                <span className="text-sm font-medium text-gray-400">
                  표지 이미지 없음
                </span>
              </div>
            )}
          </div>

          {/* 표지 URL 입력 & 업로드 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">
                표지 이미지
              </label>
              <div className="relative">
                <input
                  type="file"
                  id="cover-upload"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-2 border-mocha-200 text-mocha-600 hover:bg-mocha-50"
                  onClick={() =>
                    document.getElementById("cover-upload")?.click()
                  }
                >
                  <Upload className="w-3.5 h-3.5" />
                  파일 업로드
                </Button>
              </div>
            </div>
            <Input
              value={coverUrl}
              onChange={(e) => setCoverUrl(e.target.value)}
              placeholder="직접 URL 입력 또는 파일 업로드"
              className="rounded-lg text-xs font-mono"
            />
            <p className="text-[10px] text-muted-foreground pl-1">
              * Base64 이미지를 직접 붙여넣거나 파일을 업로드할 수 있습니다.
            </p>
          </div>
        </div>

        {/* 우측 컬럼: 작품 정보 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 제목 (읽기 전용) */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              제목{" "}
              <span className="text-muted-foreground">
                (서재에서 수정 가능)
              </span>
            </label>
            {isWorkLoading ? (
              <div className="h-11 bg-muted animate-pulse rounded-lg" />
            ) : (
              <div className="relative group">
                <Input
                  value={
                    existingWork?.title ||
                    draft?.workTitle ||
                    draft?.title ||
                    "새 웹소설"
                  }
                  disabled
                  className="rounded-lg bg-gray-50/80 border-dashed border-gray-300 font-bold text-gray-500 cursor-not-allowed pr-10"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-[10px] px-2 py-1 rounded">
                  수정 불가
                </div>
              </div>
            )}
          </div>

          {/* 분류 (수정 가능) */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-foreground">
                분류
              </label>
              {draft?.workGenre && (
                <span className="text-[10px] px-1.5 py-0.5 bg-mocha-50 text-mocha-600 rounded border border-mocha-100">
                  Stolink 기본값:{" "}
                  {GENRE_OPTIONS.find((o) => o.value === draft.workGenre)
                    ?.label || draft.workGenre}
                </span>
              )}
            </div>
            <Select value={genre} onValueChange={(v) => setGenre(v as Genre)}>
              <SelectTrigger className="rounded-lg shadow-sm border-mocha-200 focus:ring-mocha-300">
                <SelectValue placeholder="분류 선택" />
              </SelectTrigger>
              <SelectContent>
                {GENRE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 줄거리 (수정 가능) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">
                줄거리
              </label>
              <span className="text-xs text-muted-foreground">
                {synopsis.length}/{SYNOPSIS_MAX_LENGTH}
              </span>
            </div>
            <Textarea
              value={synopsis}
              onChange={(e) => {
                if (e.target.value.length <= SYNOPSIS_MAX_LENGTH) {
                  setSynopsis(e.target.value);
                }
              }}
              placeholder="작품의 줄거리를 입력하세요"
              className="min-h-[160px] rounded-lg resize-none"
            />
          </div>

          {/* 작품 공개 설정 (신규 작품일 때만) */}
          {!existingWork && !isWorkLoading && (
            <div className="glass-card p-6 rounded-2xl border border-mocha-200/50 space-y-4">
              <h3 className="font-bold text-espresso-900 flex items-center gap-2">
                <div className="p-1 bg-mocha-100 rounded">
                  <BookOpen className="w-3.5 h-3.5 text-mocha-600" />
                </div>
                작품 성격 설정 (신규 생성)
              </h3>
              <div className="flex bg-mocha-900/5 p-1 rounded-xl w-fit">
                <button
                  onClick={() => setWorkAccessType("FREE")}
                  className={`px-6 py-2 text-sm font-bold rounded-lg transition-all duration-300 ${
                    workAccessType === "FREE"
                      ? "bg-white text-emerald-600 shadow-sm transform scale-105"
                      : "text-mocha-400 hover:text-mocha-600"
                  }`}
                >
                  무료 작품
                </button>
                <button
                  onClick={() => setWorkAccessType("PAID")}
                  className={`px-6 py-2 text-sm font-bold rounded-lg transition-all duration-300 ${
                    workAccessType === "PAID"
                      ? "bg-white text-mocha-600 shadow-sm transform scale-105"
                      : "text-mocha-400 hover:text-mocha-600"
                  }`}
                >
                  유료 작품
                </button>
              </div>
              <p className="text-xs text-mocha-400/80 pl-1">
                * 작품 대문에 표시될 유료/무료 성격입니다. (나중에 수정 가능)
              </p>
            </div>
          )}

          {/* 접근 권한 및 가격 설정 (Glass) */}
          <div className="glass-card p-6 rounded-2xl border border-mocha-200/50 space-y-4">
            <h3 className="font-bold text-espresso-900 flex items-center gap-2">
              <div className="p-1 bg-mocha-100 rounded">
                <Pencil className="w-3.5 h-3.5 text-mocha-600" />
              </div>
              발행 설정
            </h3>
            <div className="flex flex-wrap gap-6 items-center">
              {/* 접근 권한 */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-mocha-400 uppercase tracking-wider block">
                  접근 권한
                </span>
                <div className="flex bg-mocha-900/5 p-1 rounded-xl">
                  <button
                    onClick={() => setAccessType("FREE")}
                    className={`px-4 py-2 text-sm font-bold rounded-lg transition-all duration-300 ${
                      accessType === "FREE"
                        ? "bg-white text-emerald-600 shadow-sm transform scale-105"
                        : "text-mocha-400 hover:text-mocha-600"
                    }`}
                  >
                    무료
                  </button>
                  <button
                    onClick={() => setAccessType("PAID")}
                    className={`px-4 py-2 text-sm font-bold rounded-lg transition-all duration-300 ${
                      accessType === "PAID"
                        ? "bg-white text-mocha-600 shadow-sm transform scale-105"
                        : "text-mocha-400 hover:text-mocha-600"
                    }`}
                  >
                    유료
                  </button>
                </div>
              </div>

              {/* 가격 설정 */}
              <AnimatePresence>
                {accessType === "PAID" && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="space-y-2"
                  >
                    <span className="text-xs font-bold text-mocha-400 uppercase tracking-wider block">
                      가격 (크레딧)
                    </span>
                    <div className="relative w-32 group">
                      <Input
                        type="number"
                        inputMode="numeric"
                        min={0}
                        step={100}
                        value={price}
                        onChange={(e) => setPrice(Number(e.target.value))}
                        className="pr-10 text-right h-10 bg-white/50 border-mocha-200 focus:bg-white focus:border-mocha-400 font-bold text-lg text-espresso-900 transition-all font-mono"
                      />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-mocha-400 font-bold group-focus-within:text-mocha-600">
                        C
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <p className="text-xs text-mocha-400/80 pl-1">
              * 유료 발행 시 독자는 설정된 크레딧을 지불하고 챕터를 열람하게
              됩니다.
            </p>
          </div>

          {/* 병합 요약 카드 */}
          <ChapterSummaryCard
            draft={draft}
            onPreviewGraph={() => setShowGraphModal(true)}
          />

          {/* 성공/에러 메시지 */}
          {publishMutation.isSuccess && (
            <div className="p-4 bg-green-50 rounded-xl border border-green-200 text-green-700 text-sm font-bold text-center animate-in fade-in zoom-in duration-300">
              ✨ 축하합니다! 작품이 성공적으로 게시되었습니다. 잠시 후
              이동합니다...
            </div>
          )}
          {publishMutation.isError && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-600 dark:text-red-400 text-sm font-medium text-center">
              <AlertCircle className="w-4 h-4 inline-block mr-1.5 mb-0.5" />
              {(publishMutation.error as { response?: { status?: number } })
                ?.response?.status === 409
                ? "이미 게시된 챕터입니다."
                : "게시 중 오류가 발생했습니다. 다시 시도해주세요."}
            </div>
          )}

          {/* 액션 버튼 */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-xl px-8 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all shadow-sm"
                  disabled={
                    publishMutation.isPending || deleteDraftMutation.isPending
                  }
                >
                  취소
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>게시를 취소하시겠습니까?</AlertDialogTitle>
                  <AlertDialogDescription>
                    작성 중인 데이터와 대기 중인 항목들이 사라집니다. 정말
                    취소하시겠습니까?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>계속 진행</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleCancel}
                    className="bg-red-500 hover:bg-red-600"
                  >
                    네, 취소합니다
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button
              size="lg"
              className="rounded-xl px-6 bg-mocha-500 hover:bg-mocha-600 text-paper font-semibold shadow-md transition-all active:scale-[0.98]"
              onClick={handlePublish}
              disabled={
                publishMutation.isPending || deleteDraftMutation.isPending
              }
            >
              {publishMutation.isPending ? (
                <div className="flex items-center gap-1.5 ">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>게시 중...</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4" />
                  <span>{isBatchMode ? "전체 게시하기" : "게시하기"}</span>
                </div>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* 관계도 모달 */}
      <GraphModal
        isOpen={showGraphModal}
        onClose={() => setShowGraphModal(false)}
        characters={
          draft?.graphSnapshot
            ? (adaptGraphSnapshot(
                draft.graphSnapshot as Parameters<typeof adaptGraphSnapshot>[0],
              )?.characters ?? [])
            : []
        }
        links={
          draft?.graphSnapshot
            ? (adaptGraphSnapshot(
                draft.graphSnapshot as Parameters<typeof adaptGraphSnapshot>[0],
              )?.links ?? [])
            : []
        }
        graphSnapshot={draft?.graphSnapshot as GraphSnapshotDTO | undefined}
      />
    </div>
  );
}

// === 메인 WritePage 컴포넌트 ===
export const WritePage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // 쿼리 파라미터 추출
  const draftId = searchParams.get("draftId");
  const draftIdsParam = searchParams.get("draftIds");
  const draftIds = useMemo(() => {
    return draftIdsParam ? draftIdsParam.split(",").filter(Boolean) : [];
  }, [draftIdsParam]);

  // 다중 Draft 모드 여부
  const isBatchMode = draftIds.length > 0;

  const { isAuthenticated } = useAuthStore();
  const { openAuthModal } = useAuthModalStore();

  // 단일 Draft 조회
  const { data: singleDraft, isLoading: isSingleDraftLoading } = useDraft(
    isAuthenticated && !isBatchMode ? draftId : null,
  );

  // 다중 Draft 조회
  const { data: multipleDrafts, isLoading: isMultipleDraftsLoading } =
    useDrafts(isAuthenticated && isBatchMode ? draftIds : []);

  // 1. 공통 데이터 추출 (작품 정보) - Hook 규칙 준수를 위해 상단 이동
  const draftForWork = useMemo(() => {
    if (isBatchMode && multipleDrafts && multipleDrafts.length > 0)
      return multipleDrafts[0];
    return singleDraft;
  }, [isBatchMode, multipleDrafts, singleDraft]);

  // 게시할 Draft 목록 결정 (단일/다중 모드 통합) - Hook 규칙 준수를 위해 상단 이동
  const allDrafts = useMemo(() => {
    if (isBatchMode && multipleDrafts) {
      return multipleDrafts;
    }
    if (singleDraft) {
      return [singleDraft];
    }
    return [];
  }, [isBatchMode, multipleDrafts, singleDraft]);

  const { data: workData, isLoading: isWorkLoading } = useWorkByProjectId(
    draftForWork?.projectId || null,
  );
  const existingWork = (
    workData as { works?: { id: string; title?: string }[] }
  )?.works?.[0];

  // 로그인 체크 - 무한 루프 방지를 위해 메모이제이션된 값 사용
  useEffect(() => {
    if (!isAuthenticated && (draftId || (draftIds && draftIds.length > 0))) {
      const redirectUrl = isBatchMode
        ? `/write?draftIds=${draftIds.join(",")}`
        : `/write?draftId=${draftId}`;
      openAuthModal(redirectUrl);
    }
  }, [isAuthenticated, openAuthModal, draftId, draftIds, isBatchMode]);

  // 완료 핸들러 (useCallback으로 래핑하여 BatchPublishView의 useEffect 의존성 안정화)
  const handleBatchComplete = useCallback(
    (workId?: string) => {
      if (workId) {
        navigate(`/author/works/${workId}/chapters`);
      } else {
        navigate("/");
      }
    },
    [navigate],
  );

  // === 에러/로딩 상태 처리 ===

  // draftId/draftIds가 없는 경우
  if (!draftId && !isBatchMode) {
    return (
      <div className="flex items-center justify-center py-20">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <CardTitle className="text-red-600">잘못된 요청</CardTitle>
            <CardDescription>
              draftId가 누락되었습니다. 작가 서비스에서 다시 배포해주세요.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button variant="outline" onClick={() => navigate("/")}>
              홈으로 이동
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 미로그인 상태
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center py-20">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>로그인이 필요합니다</CardTitle>
            <CardDescription>
              게시를 진행하려면 먼저 로그인해주세요.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button
              onClick={() => {
                const redirectUrl = isBatchMode
                  ? `/write?draftIds=${draftIds.join(",")}`
                  : `/write?draftId=${draftId}`;
                openAuthModal(redirectUrl);
              }}
            >
              로그인하기
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 로딩 중 (작품 정보 조회 포함)
  if (isSingleDraftLoading || isMultipleDraftsLoading || isWorkLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-mocha-500 animate-spin" />
          <p className="text-muted-foreground">데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // === 메인 렌더링 ===

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-background to-secondary-background">
      {/* Ambient background elements */}
      <div className="absolute -top-20 -left-20 w-64 h-64 bg-primary-light rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
      <div className="absolute -bottom-10 -right-10 w-80 h-80 bg-secondary-light rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute top-1/4 left-1/4 w-48 h-48 bg-accent-light rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>

      <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
        {/* 신규 작품 배포 시 → SinglePublishView (진행 바, 작품 정보 자동 생성) */}
        {!existingWork && draftForWork && (draftId || isBatchMode) && (
          <SinglePublishView
            draft={draftForWork}
            draftId={draftId || draftForWork.id}
            allDrafts={allDrafts}
            isBatchMode={isBatchMode}
          />
        )}

        {/* 기존 작품 추가 배포 시 → BatchPublishView (작품 정보 확인, 제목 수정 불가) */}
        {existingWork && allDrafts.length > 0 && (
          <BatchPublishView
            drafts={allDrafts}
            onComplete={handleBatchComplete}
          />
        )}

        {/* Fallback for cases where neither condition is met (should ideally not happen if initial checks pass) */}
        {!existingWork && !draftForWork && (
          <div className="text-center text-muted-foreground">
            게시할 드래프트를 찾을 수 없습니다.
          </div>
        )}
      </div>
    </div>
  );
};

export default WritePage;
