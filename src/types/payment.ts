export interface CreditPackage {
  id: number;
  name: string;
  price: number;
  creditAmount: number;
  bonusCredit: number;
  isPopular: boolean;
}

export interface PaymentPrepareRequest {
  packageId: number;
}

export interface PaymentPrepareResponse {
  orderId: string;
  orderName: string;
  amount: number;
  creditAmount: number;
  customerKey: string;
  successUrl: string;
  failUrl: string;
}

export interface PaymentConfirmRequest {
  orderId: string;
  paymentKey: string;
  amount: number;
}

export interface PaymentResponse {
  id: string;
  orderId: string;
  orderName: string;
  amount: number;
  creditAmount: number;
  status:
    | "PENDING"
    | "READY"
    | "IN_PROGRESS"
    | "DONE"
    | "CANCELED"
    | "PARTIAL_CANCELED"
    | "FAILED"
    | "EXPIRED";
  paymentKey?: string;
  paymentMethod?: string;
  approvedAt?: string;
  createdAt: string;
}
