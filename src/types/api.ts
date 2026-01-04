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
