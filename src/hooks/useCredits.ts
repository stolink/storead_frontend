import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { creditService } from "@/services/creditService";
import { useAuthStore } from "@/stores/useAuthStore";
import type { CreditUseRequest } from "@/types/credit";

export const useCredits = () => {
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();

  // 사용자 소유 크레딧 조회
  const creditsQuery = useQuery({
    queryKey: ["credits"],
    queryFn: async () => {
      const response = await creditService.getCredits();
      return response.data;
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5, // 5분
  });

  // 크레딧 사용 뮤테이션
  const useCreditMutation = useMutation({
    mutationFn: (request: CreditUseRequest) => creditService.useCredit(request),
    onSuccess: () => {
      // 크레딧 사용 성공 시 잔액 정보 무효화하여 최신화
      queryClient.invalidateQueries({ queryKey: ["credits"] });
      queryClient.invalidateQueries({ queryKey: ["credits", "transactions"] });
      // 챕터 구매 상태도 무효화해야 할 수 있음 (호출부에서 처리 권장)
    },
  });

  // 거래 내역 조회 (필요 시)
  const transactionsQuery = (
    page = 0,
    size = 20,
    type?: "CHARGE" | "USE" | "REFUND",
  ) =>
    useQuery({
      queryKey: ["credits", "transactions", { page, size, type }],
      queryFn: async () => {
        const response = await creditService.getTransactions(page, size, type);
        return response.data;
      },
      enabled: isAuthenticated,
    });

  return {
    credits: creditsQuery.data,
    isLoading: creditsQuery.isLoading,
    isError: creditsQuery.isError,
    refetch: creditsQuery.refetch,
    balance: creditsQuery.data?.balance ?? 0,
    useCredit: useCreditMutation.mutate,
    useCreditAsync: useCreditMutation.mutateAsync,
    isUsing: useCreditMutation.isPending,
    getTransactions: transactionsQuery,
  };
};
