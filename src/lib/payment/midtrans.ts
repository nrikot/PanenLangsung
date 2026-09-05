import type {
  PaymentProvider,
  CreatePaymentRequest,
  CreatePaymentResponse,
  PaymentCallbackData,
  PaymentNotificationData,
} from "./types";

const MIDTRANS_BASE_URL = "https://api.sandbox.midtrans.com";
const MIDTRANS_SNAP_URL = "https://app.sandbox.midtrans.com/snap";

export class MidtransPaymentProvider implements PaymentProvider {
  private serverKey: string;
  private clientKey: string;
  private isProduction: boolean;

  constructor() {
    this.serverKey = process.env.MIDTRANS_SERVER_KEY || "";
    this.clientKey = process.env.MIDTRANS_CLIENT_KEY || "";
    this.isProduction = process.env.MIDTRANS_PRODUCTION === "true";

    if (!this.serverKey || !this.clientKey) {
      console.warn("MidTrans keys not configured. Payment features will not work.");
    }
  }

  private getAuthHeader(): string {
    return `Basic ${Buffer.from(`${this.serverKey}:`).toString("base64")}`;
  }

  private getBaseUrl(): string {
    return this.isProduction
      ? "https://api.midtrans.com"
      : MIDTRANS_BASE_URL;
  }

  private getSnapUrl(): string {
    return this.isProduction
      ? "https://app.midtrans.com/snap"
      : MIDTRANS_SNAP_URL;
  }

  async createPayment(request: CreatePaymentRequest): Promise<CreatePaymentResponse> {
    const parameter = {
      transaction_details: {
        order_id: request.orderId,
        gross_amount: request.amount,
      },
      item_details: request.items.map((item) => ({
        id: item.id,
        price: item.price,
        quantity: item.quantity,
        name: item.name,
      })),
      customer_details: {
        first_name: request.buyerName,
        email: request.buyerEmail,
      },
      callbacks: {
        finish: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/pembeli/pesanan`,
      },
    };

    const response = await fetch(`${this.getSnapUrl()}/v1/transactions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: this.getAuthHeader(),
      },
      body: JSON.stringify(parameter),
    });

    const data = await response.json();

    if (data.error_messages && data.error_messages.length > 0) {
      throw new Error(`MidTrans error: ${data.error_messages.join(", ")}`);
    }

    if (!data.token || !data.redirect_url) {
      throw new Error("Invalid response from MidTrans: missing token or redirect_url");
    }

    return {
      token: data.token,
      redirectUrl: data.redirect_url,
    };
  }

  async verifyCallback(notification: PaymentNotificationData): Promise<PaymentCallbackData> {
    const orderId = notification.order_id;

    // Fetch actual transaction status from MidTrans API
    const response = await fetch(
      `${this.getBaseUrl()}/${orderId}/status`,
      {
        method: "GET",
        headers: {
          Authorization: this.getAuthHeader(),
        },
      }
    );

    const data = await response.json();

    if (data.status_code && data.status_code !== "200" && data.status_code !== "201") {
      throw new Error(`MidTrans status check failed: ${data.status_message}`);
    }

    return {
      order_id: data.order_id || orderId,
      transaction_id: data.transaction_id || notification.transaction_id,
      transaction_status: data.transaction_status || notification.transaction_status,
      fraud_status: data.fraud_status || notification.fraud_status,
      payment_type: data.payment_type || notification.payment_type,
      gross_amount: data.gross_amount || notification.gross_amount,
      va_numbers: data.va_numbers,
      permata_va_number: data.permata_va_number,
      biller_code: data.biller_code,
      bill_key: data.bill_key,
      qris_url: data.qris_url,
    };
  }

  async refund(
    orderId: string,
    amount: number
  ): Promise<{ refundId: string; status: string }> {
    const response = await fetch(
      `${this.getBaseUrl()}/${orderId}/refund`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: this.getAuthHeader(),
        },
        body: JSON.stringify({
          refund_amount: amount,
          reason: "Customer requested refund",
        }),
      }
    );

    const data = await response.json();

    if (data.status_code && data.status_code !== "200" && data.status_code !== "201") {
      throw new Error(`MidTrans refund failed: ${data.status_message}`);
    }

    return {
      refundId: data.refund_id || data.transaction_id,
      status: data.refund_status || data.transaction_status || "pending",
    };
  }
}

let provider: MidtransPaymentProvider | null = null;

export function getPaymentProvider(): MidtransPaymentProvider {
  if (!provider) {
    provider = new MidtransPaymentProvider();
  }
  return provider;
}
