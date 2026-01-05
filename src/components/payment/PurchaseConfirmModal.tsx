/**
 * 챕터 구매 확인 모달
 * 
 * 크레딧 잔액 확인 -> 구매 확인 -> 구매 완료 프로세스
 * 잔액 부족 시 충전 페이지 안내
 */
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Coins, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useChapterPurchase, useChapterPurchaseCheck } from '@/hooks/useChapterPurchase';
import type { Chapter } from '@/types';

interface PurchaseConfirmModalProps {
    /** 모달 열림 상태 */
    isOpen: boolean;
    /** 모달 닫기 핸들러 */
    onClose: () => void;
    /** 구매할 챕터 정보 */
    chapter: Chapter;
    /** 작품 ID */
    workId: string;
    /** 구매 성공 후 콜백 */
    onPurchaseSuccess?: () => void;
}

type ModalStep = 'confirm' | 'processing' | 'success' | 'insufficient';

export function PurchaseConfirmModal({
    isOpen,
    onClose,
    chapter,
    workId,
    onPurchaseSuccess,
}: PurchaseConfirmModalProps) {
    const navigate = useNavigate();
    const [step, setStep] = useState<ModalStep>('confirm');

    // 구매 가능 여부 확인
    const { data: purchaseCheck, isLoading: checkLoading } = useChapterPurchaseCheck(chapter.id);

    // 구매 실행 뮤테이션
    const purchaseMutation = useChapterPurchase();

    // 챕터 가격 (기본값 0)
    const chapterPrice = chapter.price || purchaseCheck?.chapterPrice || 0;
    const currentBalance = purchaseCheck?.currentBalance || 0;
    const afterBalance = currentBalance - chapterPrice;
    const canAfford = currentBalance >= chapterPrice;

    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // 컴포넌트 언마운트 시 타이머 정리
    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, []);

    // 구매 실행
    const handlePurchase = async () => {
        if (!canAfford) {
            setStep('insufficient');
            return;
        }

        setStep('processing');

        try {
            await purchaseMutation.mutateAsync({
                chapterId: chapter.id,
                workId,
            });
            setStep('success');

            // 2초 후 자동으로 닫고 콜백 실행
            timerRef.current = setTimeout(() => {
                onClose();
                onPurchaseSuccess?.();
            }, 1500);
        } catch {
            // 에러 시 확인 단계로 복귀
            setStep('confirm');
        }
    };

    // 충전 페이지로 이동
    const handleGoToCharge = () => {
        onClose();
        navigate('/payment/charge');
    };

    // 모달 닫기 시 상태 초기화
    const handleClose = () => {
        setStep('confirm');
        onClose();
    };

    // 이미 구매한 경우
    if (purchaseCheck?.alreadyPurchased) {
        return (
            <Dialog open={isOpen} onOpenChange={handleClose}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-sage-500" />
                            이미 구매한 챕터입니다
                        </DialogTitle>
                        <DialogDescription>
                            "{chapter.title}"은(는) 이미 구매하셨습니다.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button onClick={handleClose}>확인</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                {/* 로딩 상태 */}
                {checkLoading ? (
                    <div className="flex flex-col items-center py-8">
                        <Loader2 className="w-8 h-8 animate-spin text-mocha-500 mb-4" />
                        <p className="text-muted-foreground">잔액을 확인하고 있습니다...</p>
                    </div>
                ) : (
                    <>
                        {/* 구매 확인 단계 */}
                        {step === 'confirm' && (
                            <>
                                <DialogHeader>
                                    <DialogTitle>챕터 구매</DialogTitle>
                                    <DialogDescription>
                                        제{chapter.chapterNumber}화 "{chapter.title}"을(를) 구매하시겠습니까?
                                    </DialogDescription>
                                </DialogHeader>

                                <div className="space-y-4 py-4">
                                    {/* 가격 정보 */}
                                    <div className="bg-mocha-50 dark:bg-mocha-900/20 rounded-lg p-4 space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-muted-foreground">챕터 가격</span>
                                            <span className="font-semibold flex items-center gap-1">
                                                <Coins className="w-4 h-4 text-amber-500" />
                                                {chapterPrice} C
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-muted-foreground">보유 크레딧</span>
                                            <span className={`font-semibold ${!canAfford ? 'text-red-500' : ''}`}>
                                                {currentBalance} C
                                            </span>
                                        </div>
                                        <hr className="border-mocha-200 dark:border-mocha-700" />
                                        <div className="flex justify-between items-center">
                                            <span className="text-muted-foreground">구매 후 잔액</span>
                                            <span className={`font-semibold ${afterBalance < 0 ? 'text-red-500' : 'text-sage-600'}`}>
                                                {afterBalance >= 0 ? afterBalance : '잔액 부족'} {afterBalance >= 0 && 'C'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* 잔액 부족 경고 */}
                                    {!canAfford && (
                                        <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg text-sm">
                                            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                                            <div>
                                                <p className="font-medium">크레딧이 부족합니다</p>
                                                <p className="text-red-600 dark:text-red-300">
                                                    {Math.abs(afterBalance)} C가 더 필요합니다. 충전 후 구매해 주세요.
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <DialogFooter className="gap-2 sm:gap-0">
                                    <Button variant="outline" onClick={handleClose}>
                                        취소
                                    </Button>
                                    {canAfford ? (
                                        <Button
                                            onClick={handlePurchase}
                                            className="bg-mocha-500 hover:bg-mocha-600"
                                        >
                                            <Coins className="w-4 h-4 mr-2" />
                                            {chapterPrice} C로 구매
                                        </Button>
                                    ) : (
                                        <Button onClick={handleGoToCharge}>
                                            충전하러 가기
                                        </Button>
                                    )}
                                </DialogFooter>
                            </>
                        )}

                        {/* 처리 중 */}
                        {step === 'processing' && (
                            <div className="flex flex-col items-center py-8">
                                <Loader2 className="w-8 h-8 animate-spin text-mocha-500 mb-4" />
                                <p className="text-muted-foreground">구매 처리 중...</p>
                            </div>
                        )}

                        {/* 구매 성공 */}
                        {step === 'success' && (
                            <div className="flex flex-col items-center py-8">
                                <div className="w-16 h-16 rounded-full bg-sage-100 dark:bg-sage-900/30 flex items-center justify-center mb-4">
                                    <CheckCircle className="w-8 h-8 text-sage-500" />
                                </div>
                                <h3 className="text-lg font-semibold mb-2">구매 완료!</h3>
                                <p className="text-muted-foreground text-center">
                                    "{chapter.title}"을(를) 이제 읽을 수 있습니다.
                                </p>
                            </div>
                        )}

                        {/* 잔액 부족 */}
                        {step === 'insufficient' && (
                            <>
                                <DialogHeader>
                                    <DialogTitle className="flex items-center gap-2 text-red-600">
                                        <AlertCircle className="w-5 h-5" />
                                        크레딧 부족
                                    </DialogTitle>
                                    <DialogDescription>
                                        이 챕터를 구매하려면 {Math.abs(afterBalance)} C가 더 필요합니다.
                                    </DialogDescription>
                                </DialogHeader>
                                <DialogFooter className="gap-2 sm:gap-0">
                                    <Button variant="outline" onClick={() => setStep('confirm')}>
                                        뒤로
                                    </Button>
                                    <Button onClick={handleGoToCharge}>
                                        충전하러 가기
                                    </Button>
                                </DialogFooter>
                            </>
                        )}
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}

export default PurchaseConfirmModal;
