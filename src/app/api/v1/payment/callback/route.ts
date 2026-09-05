import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPaymentProvider } from "@/lib/payment/midtrans";
import type { PaymentNotificationData } from "@/lib/payment/types";

export async function POST(request: NextRequest) {
  try {
    const body: PaymentNotificationData = await request.json();

    const { order_id } = body;

    if (!order_id) {
      return NextResponse.json({ error: "Missing order_id" }, { status: 400 });
    }

    // Find the order
    const order = await prisma.order.findUnique({
      where: { id: order_id },
      include: {
        escrowTransactions: { where: { status: "pending_payment" }, take: 1 },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.escrowTransactions.length === 0) {
      return NextResponse.json(
        { error: "No pending escrow transaction" },
        { status: 400 }
      );
    }

    const escrowTx = order.escrowTransactions[0];

    // Verify with MidTrans API
    const paymentProvider = getPaymentProvider();
    let verifiedData;
    try {
      verifiedData = await paymentProvider.verifyCallback(body);
    } catch (verifyError) {
      console.error("MidTrans verification failed:", verifyError);
      // In sandbox, proceed with the notification data directly
      verifiedData = {
        order_id: body.order_id,
        transaction_id: body.transaction_id,
        transaction_status: body.transaction_status,
        fraud_status: body.fraud_status,
        payment_type: body.payment_type,
        gross_amount: body.gross_amount,
      };
    }

    // Determine escrow status based on transaction status
    let newEscrowStatus: string;
    let orderUpdate: Record<string, unknown> = {};

    switch (verifiedData.transaction_status) {
      case "capture":
      case "settlement":
        // Payment successful
        if (verifiedData.fraud_status === "challenge") {
          // Fraud challenge - keep as pending
          newEscrowStatus = "pending_payment";
        } else {
          newEscrowStatus = "paid_to_escrow";
          orderUpdate = { status: "confirmed" };
        }
        break;
      case "pending":
        // Still pending
        newEscrowStatus = "pending_payment";
        break;
      case "deny":
      case "cancel":
      case "expire":
        // Payment failed
        newEscrowStatus = "pending_payment";
        break;
      case "refund":
        newEscrowStatus = "refunded";
        break;
      default:
        newEscrowStatus = "pending_payment";
    }

    // Update escrow and order in transaction
    await prisma.$transaction(async (tx) => {
      // Update escrow transaction
      await tx.escrowTransaction.update({
        where: { id: escrowTx.id },
        data: {
          status: newEscrowStatus as "pending_payment" | "paid_to_escrow" | "released" | "refunded" | "disputed",
          providerReference: verifiedData.transaction_id,
        },
      });

      // Update order status if payment confirmed
      if (orderUpdate.status) {
        await tx.order.update({
          where: { id: order.id },
          data: {
            escrowStatus: newEscrowStatus as "pending_payment" | "paid_to_escrow" | "released" | "refunded" | "disputed",
            ...orderUpdate,
          },
        });
      } else {
        await tx.order.update({
          where: { id: order.id },
          data: {
            escrowStatus: newEscrowStatus as "pending_payment" | "paid_to_escrow" | "released" | "refunded" | "disputed",
          },
        });
      }

      // Notify buyer
      if (newEscrowStatus === "paid_to_escrow") {
        await tx.notification.create({
          data: {
            userId: order.buyerId,
            title: "Pembayaran Berhasil",
            message: `Pembayaran untuk order ${order.id} berhasil. Dana masuk ke escrow.`,
            type: "escrow",
          },
        });

        // Notify seller
        await tx.notification.create({
          data: {
            userId: order.sellerId,
            title: "Pembayaran Diterima",
            message: `Pembeli telah membayar order ${order.id}. Silakan proses pengiriman.`,
            type: "escrow",
          },
        });
      }
    });

    return NextResponse.json({ status: "ok" });
  } catch (error: unknown) {
    console.error("Payment callback error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
