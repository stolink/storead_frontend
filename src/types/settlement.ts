export interface DashboardResponse {
  totalEarned: number;
  pendingBalance: number;
  totalSettled: number;
  revenueByMonth: RevenueByMonth[];
  revenueByWork: RevenueByWork[];
  recentTransactions: RevenueTransactionResponse[];
}

export interface RevenueByMonth {
  month: string;
  totalRevenue: number;
  transactionCount: number;
}

export interface RevenueByWork {
  workId: string;
  workTitle: string;
  totalRevenue: number;
  transactionCount: number;
}

export interface RevenueTransactionResponse {
  id: string;
  authorId: string;
  type: "CHAPTER_SALE" | "REFUND" | "ADJUSTMENT";
  creditAmount: number;
  platformFee: number;
  authorShare: number;
  referenceId: string | null;
  description: string | null;
  status: "COMPLETED" | "FAILED" | "CANCELLED";
  isSettled: boolean;
  settlementId: string | null;
  createdAt: string;
}

export interface SettlementResponse {
  id: string;
  authorId: string;
  periodStart: string;
  periodEnd: string;
  grossAmount: number;
  platformFeeTotal: number;
  netAmount: number;
  transactionCount: number;
  status:
    | "PENDING"
    | "CONFIRMED"
    | "PROCESSING"
    | "COMPLETED"
    | "FAILED"
    | "REJECTED";
  rejectReason: string | null;
  confirmedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SettlementRejectRequest {
  reason: string;
}
