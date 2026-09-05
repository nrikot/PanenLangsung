export interface PaymentItem {
  id: string;
  price: number;
  quantity: number;
  name: string;
}

export interface CreatePaymentRequest {
  orderId: string;
  amount: number;
  buyerName: string;
  buyerEmail: string;
  items: PaymentItem[];
}

export interface CreatePaymentResponse {
  token: string;
  redirectUrl: string;
}

export interface PaymentCallbackData {
  order_id: string;
  transaction_id: string;
  transaction_status: string;
  fraud_status?: string;
  payment_type: string;
  gross_amount: string;
  va_numbers?: { bank: string; va_number: string }[];
  permata_va_number?: string;
  biller_code?: string;
  bill_key?: string;
  qris_url?: string;
}

export interface PaymentNotificationData {
  order_id: string;
  transaction_id: string;
  transaction_status: string;
  fraud_status?: string;
  status_code: string;
  status_message: string;
  gross_amount: string;
  payment_type: string;
  transaction_time: string;
  settlement_time?: string;
}

export type TransactionStatus =
  | "capture"
  | "settlement"
  | "pending"
  | "deny"
  | "cancel"
  | "expire"
  | "refund"
  | "partial_refund"
  | "chargeback"
  | "void";

export interface PaymentProvider {
  createPayment(request: CreatePaymentRequest): Promise<CreatePaymentResponse>;
  verifyCallback(notification: PaymentNotificationData): Promise<PaymentCallbackData>;
  refund(orderId: string, amount: number): Promise<{ refundId: string; status: string }>;
}
