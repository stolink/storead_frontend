import api from "@/api/client";
import type { ApiResponse } from "@/types/api";
import type {
  CreditPackage,
  PaymentPrepareRequest,
  PaymentPrepareResponse,
  PaymentConfirmRequest,
  PaymentResponse,
} from "@/types/payment";
import type { AxiosRequestConfig } from "axios";

export const paymentService = {
  getPackages: async (): Promise<ApiResponse<CreditPackage[]>> => {
    const response = await api.get<ApiResponse<CreditPackage[]>>(
      "/payments/packages",
      {
        skipAuthHandler: true,
      } as AxiosRequestConfig,
    );
    return response.data;
  },

  preparePayment: async (
    request: PaymentPrepareRequest,
  ): Promise<ApiResponse<PaymentPrepareResponse>> => {
    const idempotencyKey = window.crypto.randomUUID();
    const response = await api.post<ApiResponse<PaymentPrepareResponse>>(
      "/payments/prepare",
      request,
      {
        headers: {
          "Idempotency-Key": idempotencyKey,
        },
      } as AxiosRequestConfig,
    );
    return response.data;
  },

  confirmPayment: async (
    request: PaymentConfirmRequest,
  ): Promise<ApiResponse<PaymentResponse>> => {
    const response = await api.post<ApiResponse<PaymentResponse>>(
      "/payments/confirm",
      request,
    );
    return response.data;
  },
};
