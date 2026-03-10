import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { settlementService } from "@/services/settlementService";

export const settlementKeys = {
  all: ["settlements"] as const,
  dashboard: () => [...settlementKeys.all, "dashboard"] as const,
  revenues: () => [...settlementKeys.all, "revenues"] as const,
  revenuesList: (page: number, size: number) =>
    [...settlementKeys.revenues(), { page, size }] as const,
  list: () => [...settlementKeys.all, "list"] as const,
  listPaginated: (page: number, size: number) =>
    [...settlementKeys.list(), { page, size }] as const,
};

export const useSettlementDashboard = () => {
  return useQuery({
    queryKey: settlementKeys.dashboard(),
    queryFn: () => settlementService.getDashboard(),
    select: (data) => data.data,
  });
};

export const useRevenueTransactions = (page: number = 0, size: number = 20) => {
  return useQuery({
    queryKey: settlementKeys.revenuesList(page, size),
    queryFn: () => settlementService.getRevenueTransactions(page, size),
    select: (data) => data.data,
  });
};

export const useSettlements = (page: number = 0, size: number = 20) => {
  return useQuery({
    queryKey: settlementKeys.listPaginated(page, size),
    queryFn: () => settlementService.getSettlements(page, size),
    select: (data) => data.data,
  });
};

export const useRequestSettlement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      periodStart,
      periodEnd,
    }: {
      periodStart: string;
      periodEnd: string;
    }) => settlementService.requestSettlement(periodStart, periodEnd),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settlementKeys.all });
    },
  });
};

export const useConfirmSettlement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (settlementId: string) =>
      settlementService.confirmSettlement(settlementId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settlementKeys.all });
    },
  });
};

export const useRejectSettlement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      settlementId,
      reason,
    }: {
      settlementId: string;
      reason: string;
    }) => settlementService.rejectSettlement(settlementId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settlementKeys.all });
    },
  });
};
