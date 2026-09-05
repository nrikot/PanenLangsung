import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/middleware/auth";
import { prisma } from "@/lib/prisma";
import { ResolveDisputeSchema } from "@/lib/validations/order";
import { getPaymentProvider } from "@/lib/payment/midtrans";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(request, async (authUser) => {
    if (authUser.role !== "admin") {
      return NextResponse.json(
        { error: "Hanya admin yang bisa menyelesaikan sengketa" },
        { status: 403 }
      );
    }

    try {
      const order = await prisma.order.findUnique({
        where: { id: params.id },
        include: {
          escrowTransactions: { where: { status: "disputed" }, take: 1 },
        },
      });

      if (!order) {
        return NextResponse.json({ error: "Order tidak ditemukan" }, { status: 404 });
      }

      if (order.disputeStatus !== "raised") {
        return NextResponse.json(
          { error: "Tidak ada sengketa aktif untuk order ini" },
          { status: 400 }
        );
      }

      if (order.escrowTransactions.length === 0) {
        return NextResponse.json(
          { error: "Escrow transaction tidak ditemukan" },
          { status: 400 }
        );
      }

      const body = await request.json();
      const parsed = ResolveDisputeSchema.safeParse(body);

      if (!parsed.success) {
        return NextResponse.json(
          { error: "Data tidak valid", details: parsed.error.flatten().fieldErrors },
          { status: 400 }
        );
      }

      const { resolution, releaseAmount, refundAmount, reason } = parsed.data;
      const escrowTx = order.escrowTransactions[0];

      // Calculate amounts
      let finalReleaseAmount = 0;
      let finalRefundAmount = 0;

      switch (resolution) {
        case "release_to_seller":
          finalReleaseAmount = order.totalAmount;
          finalRefundAmount = 0;
          break;
        case "refund_to_buyer":
          finalReleaseAmount = 0;
          finalRefundAmount = order.totalAmount;
          break;
        case "partial":
          finalReleaseAmount = releaseAmount || 0;
          finalRefundAmount = refundAmount || 0;
          if (finalReleaseAmount + finalRefundAmount > order.totalAmount) {
            return NextResponse.json(
              { error: "Total pencairan dan pengembalian melebihi jumlah order" },
              { status: 400 }
            );
          }
          break;
      }

      // Process refund if needed
      let refundResult = null;
      if (finalRefundAmount > 0) {
        try {
          const paymentProvider = getPaymentProvider();
          refundResult = await paymentProvider.refund(order.id, finalRefundAmount);
        } catch (refundError) {
          console.error("Refund processing error:", refundError);
          // Continue with DB update even if refund API fails
          // Admin can manually process refund later
        }
      }

      // Update order and escrow in transaction
      await prisma.$transaction(async (tx) => {
        // Update order
        await tx.order.update({
          where: { id: order.id },
          data: {
            disputeStatus: "resolved",
            escrowStatus: finalReleaseAmount > 0 && finalRefundAmount === 0 ? "released" : "refunded",
          },
        });

        // Update escrow transaction
        await tx.escrowTransaction.update({
          where: { id: escrowTx.id },
          data: {
            status: finalReleaseAmount > 0 && finalRefundAmount === 0 ? "released" : "refunded",
            releasedAmount: finalReleaseAmount,
            refundedAmount: finalRefundAmount,
            releasedAt: new Date(),
          },
        });

        // Notify buyer
        await tx.notification.create({
          data: {
            userId: order.buyerId,
            title: "Sengketa Diselesaikan",
            message: `Sengketa pesanan ${order.id} telah diselesaikan. ${resolution === "refund_to_buyer" ? "Dana dikembalikan." : resolution === "release_to_seller" ? "Dana dilepas ke penjual." : "Dana dibagi sesuai keputusan admin."}`,
            type: "dispute",
          },
        });

        // Notify seller
        await tx.notification.create({
          data: {
            userId: order.sellerId,
            title: "Sengketa Diselesaikan",
            message: `Sengketa pesanan ${order.id} telah diselesaikan. ${resolution === "release_to_seller" ? "Dana dilepas ke Anda." : resolution === "refund_to_buyer" ? "Dana dikembalikan ke pembeli." : "Dana dibagi sesuai keputusan admin."}`,
            type: "dispute",
          },
        });
      });

      return NextResponse.json({
        message: "Sengketa berhasil diselesaikan",
        resolution: {
          orderId: order.id,
          type: resolution,
          releaseAmount: finalReleaseAmount,
          refundAmount: finalRefundAmount,
          refundId: refundResult?.refundId || null,
          reason: reason || null,
        },
      });
    } catch (error: unknown) {
      console.error("Resolve dispute error:", error);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
  });
}
