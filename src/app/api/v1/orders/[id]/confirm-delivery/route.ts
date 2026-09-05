import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/middleware/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(request, async (authUser) => {
    if (authUser.role !== "pembeli") {
      return NextResponse.json(
        { error: "Hanya pembeli yang bisa mengkonfirmasi penerimaan" },
        { status: 403 }
      );
    }

    try {
      const order = await prisma.order.findUnique({
        where: { id: params.id },
        include: {
          trackingEvents: { orderBy: { createdAt: "desc" }, take: 1 },
        },
      });

      if (!order) {
        return NextResponse.json({ error: "Order tidak ditemukan" }, { status: 404 });
      }

      if (order.buyerId !== authUser.id) {
        return NextResponse.json({ error: "Bukan order Anda" }, { status: 403 });
      }

      if (order.status !== "arrived") {
        return NextResponse.json(
          { error: "Hanya pesanan dengan status 'Tiba di Kota' yang bisa dikonfirmasi" },
          { status: 400 }
        );
      }

      // Update order status to delivered
      const updatedOrder = await prisma.$transaction(async (tx) => {
        const updated = await tx.order.update({
          where: { id: order.id },
          data: { status: "delivered" },
        });

        // Create tracking event
        await tx.orderTrackingEvent.create({
          data: {
            orderId: order.id,
            status: "delivered",
            note: "Dikonfirmasi diterima oleh pembeli",
          },
        });

        // Notify seller
        await tx.notification.create({
          data: {
            userId: order.sellerId,
            title: "Pesanan Diterima",
            message: `Pembeli telah mengkonfirmasi penerimaan pesanan ${order.id}. Dana akan dilepas dalam 2x24 jam jika tidak ada komplain.`,
            type: "order",
          },
        });

        return updated;
      });

      return NextResponse.json({
        message: "Pesanan berhasil dikonfirmasi diterima",
        order: {
          id: updatedOrder.id,
          status: updatedOrder.status,
        },
        escrowInfo: {
          message: "Dana akan otomatis dilepas dalam 2x24 jam jika tidak ada komplain",
          autoReleaseAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        },
      });
    } catch (error: unknown) {
      console.error("Confirm delivery error:", error);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
  });
}
