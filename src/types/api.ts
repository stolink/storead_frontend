export interface ApiResponse<T> {
  code: number;
  status: string;
  message: string;
  data: T;
}

export interface JobResponse {
  jobId: string;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  progress: number;
  result?: unknown;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * API 에러 응답 타입
 * catch 블록에서 타입 안전하게 에러 처리 가능
 */
export interface ApiError {
  response?: {
    data?: {
      message?: string;
      code?: number;
    };
  };
  message?: string;
}
