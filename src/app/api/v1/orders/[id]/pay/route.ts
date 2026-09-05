import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/middleware/auth";
import { prisma } from "@/lib/prisma";
import { getPaymentProvider } from "@/lib/payment/midtrans";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(request, async (authUser) => {
    if (authUser.role !== "pembeli") {
      return NextResponse.json(
        { error: "Hanya pembeli yang bisa melakukan pembayaran" },
        { status: 403 }
      );
    }

    try {
      const order = await prisma.order.findUnique({
        where: { id: params.id },
        include: {
          buyer: { select: { id: true, name: true, email: true } },
          commodity: { select: { name: true } },
          escrowTransactions: { where: { status: "pending_payment" }, take: 1 },
        },
      });

      if (!order) {
        return NextResponse.json({ error: "Order tidak ditemukan" }, { status: 404 });
      }

      if (order.buyerId !== authUser.id) {
        return NextResponse.json({ error: "Bukan order Anda" }, { status: 403 });
      }

      if (order.escrowStatus !== "pending_payment") {
        return NextResponse.json(
          { error: "Order sudah dibayar atau status tidak valid" },
          { status: 400 }
        );
      }

      if (order.status === "cancelled") {
        return NextResponse.json(
          { error: "Order sudah dibatalkan" },
          { status: 400 }
        );
      }

      if (order.escrowTransactions.length === 0) {
        return NextResponse.json(
          { error: "Escrow transaction tidak ditemukan" },
          { status: 400 }
        );
      }

      const paymentProvider = getPaymentProvider();

      const paymentResult = await paymentProvider.createPayment({
        orderId: order.id,
        amount: order.totalAmount,
        buyerName: order.buyer.name || order.buyer.email,
        buyerEmail: order.buyer.email,
        items: [
          {
            id: order.commodityId,
            price: order.agreedPrice,
            quantity: order.quantity,
            name: order.commodity.name,
          },
        ],
      });

      // Update escrow transaction with payment token
      await prisma.escrowTransaction.update({
        where: { id: order.escrowTransactions[0].id },
        data: {
          providerReference: paymentResult.token,
        },
      });

      // Create notification for seller
      await prisma.notification.create({
        data: {
          userId: order.sellerId,
          title: "Pembayaran Dalam Proses",
          message: `Pembeli sedang memproses pembayaran untuk order ${order.id}`,
          type: "escrow",
        },
      });

      return NextResponse.json({
        message: "Payment token berhasil dibuat",
        payment: {
          token: paymentResult.token,
          redirectUrl: paymentResult.redirectUrl,
          orderId: order.id,
          amount: order.totalAmount,
        },
      });
    } catch (error: unknown) {
      console.error("Create payment error:", error);
      const message =
        error instanceof Error ? error.message : "Internal Server Error";
      return NextResponse.json({ error: message }, { status: 500 });
    }
  });
}
