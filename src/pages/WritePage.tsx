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
import { useAuthStore } from "@/stores/useAuthStore";
import { useAuthModalStore } from "@/stores/useAuthModalStore";
import { useDraft, useDrafts, useDeleteDraft, type Draft } from "@/hooks/useDraft";
import { usePublish } from "@/hooks/usePublish";
import { useWorkByProjectId } from "@/hooks/useWorks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { GraphModal } from "@/components/viewer/GraphModal";
import { adaptGraphSnapshot } from "@/adapters/graphSnapshotAdapter";
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
  ListChecks,
  RotateCcw,
  Filter,
  Pencil,
  Info,
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
  onComplete: () => void;
}

function BatchPublishView({ drafts, onComplete }: BatchPublishViewProps) {
  const navigate = useNavigate();
  const publishMutation = usePublish();
  const deleteDraftMutation = useDeleteDraft();
  const updateDraftMutation = useUpdateDraft();

  // 각 Draft의 게시 상태 관리
  const [publishedIds, setPublishedIds] = useState<Set<string>>(new Set());
  const [errorMessages, setErrorMessages] = useState<Map<string, string>>(new Map());
  const [currentPublishingId, setCurrentPublishingId] = useState<string | null>(null);

  // UI 상태
  const [showOnlyErrors, setShowOnlyErrors] = useState(false);
  const [editingDraft, setEditingDraft] = useState<Draft | null>(null);

  // 게시 진행률
  const progress = useMemo(() => {
    return {
      total: drafts.length,
      completed: publishedIds.size,
      failed: errorMessages.size,
      remaining: drafts.length - publishedIds.size - errorMessages.size,
    };
  }, [drafts.length, publishedIds.size, errorMessages.size]);

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
      await publishMutation.mutateAsync({
        draftId: draft.id,
        title: draft.title || draft.workTitle || "제목 없음",
      });
      setPublishedIds((prev) => new Set([...prev, draft.id]));
    } catch (error: any) {
      console.error("게시 실패:", draft.id, error);
      const msg = error?.response?.data?.message || error?.message || "알 수 없는 에러";
      setErrorMessages((prev) => new Map(prev).set(draft.id, msg));
    } finally {
      setCurrentPublishingId(null);
    }
  };

  // 실패한 항목 전체 재시도
  const handleRetryFailed = async () => {
    const failedDrafts = drafts.filter(d => errorMessages.has(d.id));
    for (const draft of failedDrafts) {
      if (currentPublishingId) break; // 하나씩 처리할 때 중단 가능성 대비
      await handlePublishOne(draft);
    }
  };

  // 전체 순차 게시
  const handlePublishAll = async () => {
    for (const draft of drafts) {
      if (publishedIds.has(draft.id) || errorMessages.has(draft.id)) continue;
      await handlePublishOne(draft);
    }
  };

  // 수정 저장 핸들러
  const handleEditSave = async (updates: Partial<Draft>) => {
    if (!editingDraft) return;
    await updateDraftMutation.mutateAsync({
      draftId: editingDraft.id,
      updates
    });
    // 수정 후 에러 메시지 초기화 (재시도를 위해)
    setErrorMessages((prev) => {
      const next = new Map(prev);
      next.delete(editingDraft.id);
      return next;
    });
  };

  // 취소 (남은 Draft 삭제)
  const handleCancel = async () => {
    const remainingDrafts = drafts.filter(
      (d) => !publishedIds.has(d.id) && !errorMessages.has(d.id)
    );
    for (const draft of remainingDrafts) {
      try {
        await deleteDraftMutation.mutateAsync(draft.id);
      } catch (error) {
        console.error("Draft 삭제 실패:", draft.id, error);
      }
    }
    navigate("/");
  };

  // 완료 시 홈으로 이동 (약간의 지연을 두어 성공 메시지 노출)
  useEffect(() => {
    if (progress.total > 0 && progress.completed === progress.total) {
      const timer = setTimeout(() => {
        onComplete();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [progress.completed, progress.total, onComplete]);

  // 필터링된 목록
  const filteredDrafts = useMemo(() => {
    if (!showOnlyErrors) return drafts;
    return drafts.filter(d => errorMessages.has(d.id));
  }, [drafts, showOnlyErrors, errorMessages]);

  return (
    <div className="py-8 max-w-3xl mx-auto">
      {/* 헤더 */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <ListChecks className="w-6 h-6 text-mocha-500" />
          <h1 className="text-2xl font-bold font-heading text-foreground">
            {progress.completed === progress.total ? "게시 완료!" : "일괄 게시"}
          </h1>
        </div>
        <p className="text-muted-foreground">
          {progress.completed === progress.total
            ? "축하합니다! 모든 작품이 Storead에 성공적으로 게시되었습니다."
            : `${progress.total}개의 챕터를 순서대로 게시합니다.`}
        </p>
      </div>

      {/* 진행 상황 */}
      <Card className="mb-6 overflow-hidden border-mocha-200">
        <CardHeader className="pb-3 bg-mocha-50/50">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base text-mocha-900">게시 진행 상황</CardTitle>
            {progress.failed > 0 && (
              <Button
                size="sm"
                variant="outline"
                className="h-8 border-red-200 text-red-600 hover:bg-red-50"
                onClick={handleRetryFailed}
                disabled={!!currentPublishingId}
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1" />
                실패 항목 전체 재시도
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="flex items-center gap-4 text-sm mb-4">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full font-medium">
              <CheckCircle className="w-3.5 h-3.5" />
              완료: {progress.completed}
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full font-medium">
              <Loader2 className={`w-3.5 h-3.5 ${progress.remaining > 0 ? "animate-spin" : ""}`} />
              대기: {progress.remaining}
            </div>
            {progress.failed > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 rounded-full font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                실패: {progress.failed}
              </div>
            )}
          </div>
          {/* 프로그레스 바 */}
          <div className="h-2.5 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${progress.failed > 0 ? "bg-red-400" : "bg-mocha-500"
                }`}
              style={{ width: `${(progress.completed / progress.total) * 100}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* 목록 헤더 & 필터 */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-foreground">게시 항목 리스트</h2>
        <Button
          variant="ghost"
          size="sm"
          className={`h-8 gap-1.5 ${showOnlyErrors ? "text-red-600 bg-red-50 hover:bg-red-100" : "text-muted-foreground"}`}
          onClick={() => setShowOnlyErrors(!showOnlyErrors)}
        >
          <Filter className="w-3.5 h-3.5" />
          {showOnlyErrors ? "전체 보기" : "실패 항목만 보기"}
        </Button>
      </div>

      {/* Draft 목록 */}
      <div className="space-y-4 mb-8">
        {filteredDrafts.map((draft, index) => {
          const isPublished = publishedIds.has(draft.id);
          const errorMessage = errorMessages.get(draft.id);
          const isPublishing = currentPublishingId === draft.id;

          return (
            <div
              key={draft.id}
              className={`flex flex-col p-4 rounded-xl border transition-all ${isPublished
                ? "bg-green-50/50 border-green-200"
                : errorMessage
                  ? "bg-red-50/50 border-red-200 shadow-sm"
                  : isPublishing
                    ? "bg-mocha-50/50 border-mocha-300 ring-1 ring-mocha-200"
                    : "bg-white border-border hover:border-mocha-200"
                }`}
            >
              <div className="flex items-center gap-4">
                {/* 순서 번호 */}
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shadow-sm flex-shrink-0 ${isPublished
                    ? "bg-green-500 text-white"
                    : errorMessage
                      ? "bg-red-500 text-white"
                      : "bg-muted text-muted-foreground"
                    }`}
                >
                  {isPublished ? (
                    <CheckCircle className="w-4.5 h-4.5" />
                  ) : errorMessage ? (
                    <AlertCircle className="w-4.5 h-4.5" />
                  ) : (
                    index + 1
                  )}
                </div>

                {/* 정보 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`font-semibold truncate ${isPublished ? "text-green-800" : "text-foreground"}`}>
                      {draft.title || "제목 없음"}
                    </p>
                    {!isPublished && !isPublishing && (
                      <button
                        onClick={() => setEditingDraft(draft)}
                        className="p-1 text-muted-foreground hover:text-mocha-500 transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                    {draft.content?.replace(/<[^>]*>/g, "").slice(0, 80)}
                  </p>
                </div>

                {/* 상태/액션 */}
                <div className="flex items-center gap-2 ml-4">
                  {isPublished ? (
                    <span className="text-sm text-green-600 font-bold px-3 py-1 bg-white rounded-full border border-green-100">완료</span>
                  ) : errorMessage ? (
                    <Button
                      size="sm"
                      variant="default"
                      className="bg-red-500 hover:bg-red-600 text-white h-8"
                      onClick={() => handlePublishOne(draft)}
                    >
                      <RotateCcw className="w-3.5 h-3.5 mr-1" />
                      재시도
                    </Button>
                  ) : isPublishing ? (
                    <div className="flex items-center gap-2 text-mocha-500 font-medium text-sm">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      게시 중
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 hover:bg-mocha-50 hover:text-mocha-600"
                      onClick={() => handlePublishOne(draft)}
                      disabled={!!currentPublishingId}
                    >
                      게시
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  )}
                </div>
              </div>

              {/* 실패 사유 노출 */}
              {errorMessage && (
                <div className="mt-3 ml-13 flex items-start gap-2 p-2.5 bg-white/80 rounded-lg border border-red-100">
                  <Info className="w-3.5 h-3.5 text-red-500 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-red-600 font-medium">
                    {errorMessage}
                  </p>
                </div>
              )}
            </div>
          );
        })}
        {filteredDrafts.length === 0 && showOnlyErrors && (
          <div className="py-12 text-center bg-gray-50 rounded-xl border border-dashed text-muted-foreground">
            실패한 항목이 없습니다.
          </div>
        )}
      </div>

      {/* 액션 버튼 */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-mocha-100 shadow-sm">
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
                작성 중인 데이터와 대기 중인 항목들이 사라집니다. 정말 취소하시겠습니까?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>계속 진행</AlertDialogCancel>
              <AlertDialogAction onClick={handleCancel} className="bg-red-500 hover:bg-red-600">
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
}

function SinglePublishView({ draft, draftId }: SinglePublishViewProps) {
  const navigate = useNavigate();

  // 폼 상태
  const [coverUrl, setCoverUrl] = useState("");
  const [genre, setGenre] = useState<Genre>("OTHER");
  const [synopsis, setSynopsis] = useState("");
  const [showGraphModal, setShowGraphModal] = useState(false);

  // 작품 정보는 상위 WritePage에서 제공받거나 필요시 내부에서 조회 (현재는 상위에서 로딩 처리)
  const { data: workData, isLoading: isWorkLoading } = useWorkByProjectId(
    draft?.projectId || null
  );
  const existingWork = (workData as { works?: { title?: string }[] })?.works?.[0];

  // 게시/취소 mutation
  const publishMutation = usePublish();
  const deleteDraftMutation = useDeleteDraft();

  // Draft 데이터로 폼 초기화 (draft.id 변경 시에만 실행)
  useEffect(() => {
    if (!draft?.id) return;

    // 표지 URL 초기화 (빈 값일 때만)
    if (draft.workCoverUrl) {
      setCoverUrl((prev) => prev || (draft.workCoverUrl ?? ""));
    }

    // 장르 초기화
    if (draft.workGenre) {
      const validGenre = GENRE_OPTIONS.find(
        (opt) => opt.value === draft.workGenre
      );
      if (validGenre) {
        setGenre(validGenre.value);
      }
    }

    // 줄거리 초기화 (빈 값일 때만)
    if (draft.workSynopsis) {
      setSynopsis((prev) => prev || (draft.workSynopsis ?? ""));
    } else if (draft.content) {
      const previewText = draft.content
        .replace(/<[^>]*>/g, "")
        .slice(0, 500);
      setSynopsis((prev) => prev || (previewText ?? ""));
    }
  }, [draft?.id, draft?.workCoverUrl, draft?.workGenre, draft?.workSynopsis, draft?.content]);

  // 게시하기 핸들러
  const handlePublish = async () => {
    try {
      const result = await publishMutation.mutateAsync({
        draftId,
        title: draft?.title || draft?.workTitle || "제목 없음",
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
    e: React.SyntheticEvent<HTMLImageElement, Event>
  ) => {
    e.currentTarget.style.display = "none";
  };

  return (
    <div className="py-8">
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
          <div className="aspect-[3/4] bg-muted rounded-xl overflow-hidden border border-border relative">
            {coverUrl ? (
              <img
                src={coverUrl}
                alt="표지 미리보기"
                className="w-full h-full object-cover"
                onError={handleImageError}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
                <ImageIcon className="w-12 h-12 mb-2" />
                <span className="text-sm">표지 이미지</span>
              </div>
            )}
          </div>

          {/* 표지 URL 입력 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              표지 URL
            </label>
            <Input
              value={coverUrl}
              onChange={(e) => setCoverUrl(e.target.value)}
              placeholder="https://example.com/cover.jpg"
              className="rounded-lg"
            />
          </div>
        </div>

        {/* 우측 컬럼: 작품 정보 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 제목 (읽기 전용) */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              제목 <span className="text-muted-foreground">(서재에서 수정 가능)</span>
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
              <label className="text-sm font-medium text-foreground">분류</label>
              {draft?.workGenre && (
                <span className="text-[10px] px-1.5 py-0.5 bg-mocha-50 text-mocha-600 rounded border border-mocha-100">
                  Stolink 기본값: {GENRE_OPTIONS.find(o => o.value === draft.workGenre)?.label || draft.workGenre}
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

          {/* 병합 요약 카드 */}
          <ChapterSummaryCard draft={draft} onPreviewGraph={() => setShowGraphModal(true)} />

          {/* 성공/에러 메시지 */}
          {publishMutation.isSuccess && (
            <div className="p-4 bg-green-50 rounded-xl border border-green-200 text-green-700 text-sm font-bold text-center animate-in fade-in zoom-in duration-300">
              ✨ 축하합니다! 작품이 성공적으로 게시되었습니다. 잠시 후 이동합니다...
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
                    작성 중인 데이터와 대기 중인 항목들이 사라집니다. 정말 취소하시겠습니까?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>계속 진행</AlertDialogCancel>
                  <AlertDialogAction onClick={handleCancel} className="bg-red-500 hover:bg-red-600">
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
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4" />
                  <span>게시하기</span>
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
            ? (adaptGraphSnapshot(draft.graphSnapshot as Parameters<typeof adaptGraphSnapshot>[0])?.characters ?? [])
            : []
        }
        links={
          draft?.graphSnapshot
            ? (adaptGraphSnapshot(draft.graphSnapshot as Parameters<typeof adaptGraphSnapshot>[0])?.links ?? [])
            : []
        }
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
  const {
    data: singleDraft,
    isLoading: isSingleDraftLoading,
    isError: _isSingleDraftError,
    error: _singleDraftError,
  } = useDraft(isAuthenticated && !isBatchMode ? draftId : null);

  // 다중 Draft 조회
  const {
    data: multipleDrafts,
    isLoading: isMultipleDraftsLoading,
    isError: _isMultipleDraftsError,
  } = useDrafts(isAuthenticated && isBatchMode ? draftIds : []);

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
  const handleBatchComplete = useCallback(() => {
    navigate("/");
  }, [navigate]);

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

  // 1. 공통 데이터 추출 (작품 정보)
  const draftForWork = useMemo(() => {
    if (isBatchMode && multipleDrafts && multipleDrafts.length > 0) return multipleDrafts[0];
    return singleDraft;
  }, [isBatchMode, multipleDrafts, singleDraft]);

  // 게시할 Draft 목록 결정 (단일/다중 모드 통합) - Hook 규칙 준수를 위해 조건부 return 전에 위치
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
    draftForWork?.projectId || null
  );
  const existingWork = (workData as { works?: { id: string; title?: string }[] })?.works?.[0];

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

  // 신규 작품 배포 시 → SinglePublishView (진행 바, 작품 정보 자동 생성)
  if (!existingWork) {
    const targetDraft = draftForWork;
    const targetDraftId = isBatchMode && targetDraft ? targetDraft.id : draftId;

    if (targetDraft && (targetDraftId || isBatchMode)) {
      return (
        <SinglePublishView
          draft={targetDraft}
          draftId={targetDraftId || targetDraft.id}
        />
      );
    }
  }

  // 기존 작품 추가 배포 시 → BatchPublishView (작품 정보 확인, 제목 수정 불가)
  if (existingWork && allDrafts.length > 0) {
    return <BatchPublishView drafts={allDrafts} onComplete={handleBatchComplete} />;
  }

  return null;
};

export default WritePage;
