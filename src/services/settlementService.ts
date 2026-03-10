import api from "@/api/client";
import type { ApiResponse, PaginatedResponse } from "@/types/api";
import type {
  DashboardResponse,
  RevenueTransactionResponse,
  SettlementResponse,
} from "@/types/settlement";

const BASE_URL = "/api/settlement";

export const settlementService = {
  getDashboard: async (): Promise<ApiResponse<DashboardResponse>> => {
    const response = await api.get(`${BASE_URL}/dashboard`);
    return response.data;
  },

  getRevenueTransactions: async (
    page: number = 0,
    size: number = 20,
  ): Promise<ApiResponse<PaginatedResponse<RevenueTransactionResponse>>> => {
    const response = await api.get(
      `${BASE_URL}/revenue?page=${page}&size=${size}`,
    );
    return response.data;
  },

  getSettlements: async (
    page: number = 0,
    size: number = 20,
  ): Promise<ApiResponse<PaginatedResponse<SettlementResponse>>> => {
    const response = await api.get(
      `${BASE_URL}/list?page=${page}&size=${size}`,
    );
    return response.data;
  },

  requestSettlement: async (
    periodStart: string,
    periodEnd: string,
  ): Promise<ApiResponse<SettlementResponse>> => {
    const response = await api.post(
      `${BASE_URL}/request?periodStart=${periodStart}&periodEnd=${periodEnd}`,
    );
    return response.data;
  },

  confirmSettlement: async (
    settlementId: string,
  ): Promise<ApiResponse<void>> => {
    const response = await api.post(`${BASE_URL}/${settlementId}/confirm`);
    return response.data;
  },

  rejectSettlement: async (
    settlementId: string,
    reason: string,
  ): Promise<ApiResponse<void>> => {
    const response = await api.post(`${BASE_URL}/${settlementId}/reject`, {
      reason,
    });
    return response.data;
  },
};
