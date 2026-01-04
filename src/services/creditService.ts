import api from "@/api/client";
import type { ApiResponse } from "@/types/api";
import type {
  CreditResponse,
  CreditCheckResponse,
  CreditUseRequest,
  CreditTransaction,
  PageResponse,
} from "@/types/credit";

export const creditService = {
  getCredits: async (): Promise<ApiResponse<CreditResponse>> => {
    const response = await api.get<ApiResponse<CreditResponse>>("/credits");
    return response.data;
  },

  checkCredit: async (
    amount: number
  ): Promise<ApiResponse<CreditCheckResponse>> => {
    const response = await api.get<ApiResponse<CreditCheckResponse>>(
      "/credits/check",
      {
        params: { amount },
      }
    );
    return response.data;
  },

  useCredit: async (
    request: CreditUseRequest
  ): Promise<ApiResponse<CreditResponse>> => {
    const response = await api.post<ApiResponse<CreditResponse>>(
      "/credits/use",
      request
    );
    return response.data;
  },

  getTransactions: async (
    page = 0,
    size = 20,
    type?: "CHARGE" | "USE" | "REFUND"
  ): Promise<ApiResponse<PageResponse<CreditTransaction>>> => {
    const response = await api.get<
      ApiResponse<PageResponse<CreditTransaction>>
    >("/credits/transactions", {
      params: { page, size, type },
    });
    return response.data;
  },
};
