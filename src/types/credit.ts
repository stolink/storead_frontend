export interface CreditResponse {
  id: string;
  balance: number;
  totalCharged: number;
  totalUsed: number;
  updatedAt: string;
}

export interface CreditCheckResponse {
  available: boolean;
  currentBalance: number;
  requestedAmount: number;
  afterBalance?: number;
  shortfall?: number;
}

export interface CreditUseRequest {
  amount: number;
  description: string;
  referenceType: string;
  referenceId: string;
}

export interface CreditTransaction {
  id: string;
  type: "CHARGE" | "USE" | "REFUND";
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  referenceType?: string;
  referenceId?: string;
  createdAt: string;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
