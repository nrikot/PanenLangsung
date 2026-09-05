import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/middleware/auth";
import { prisma } from "@/lib/prisma";
import { UpdateTrackingSchema } from "@/lib/validations/order";

const VALID_TRANSITIONS: Record<string, string[]> = {
  confirmed: ["packed"],
  packed: ["shipped"],
  shipped: ["arrived"],
  arrived: ["delivered"],
};

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(request, async (authUser) => {
    if (authUser.role !== "petani" && authUser.role !== "admin") {
      return NextResponse.json(
        { error: "Hanya penjual yang bisa memperbarui status pengiriman" },
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

      if (authUser.role !== "admin" && order.sellerId !== authUser.id) {
        return NextResponse.json({ error: "Bukan order Anda" }, { status: 403 });
      }

      if (order.status === "cancelled" || order.status === "delivered") {
        return NextResponse.json(
          { error: "Order sudah dibatalkan atau selesai" },
          { status: 400 }
        );
      }

      const body = await request.json();
      const parsed = UpdateTrackingSchema.safeParse(body);

      if (!parsed.success) {
        return NextResponse.json(
          { error: "Data tidak valid", details: parsed.error.flatten().fieldErrors },
          { status: 400 }
        );
      }

      const { status, note } = parsed.data;

      // Validate status transition
      const allowedTransitions = VALID_TRANSITIONS[order.status] || [];
      if (!allowedTransitions.includes(status)) {
        return NextResponse.json(
          {
            error: `Transisi status tidak valid. Status saat ini: ${order.status}. Yang diizinkan: ${allowedTransitions.join(", ") || "tidak ada"}`,
          },
          { status: 400 }
        );
      }

      // Create tracking event and update order status in transaction
      const updatedOrder = await prisma.$transaction(async (tx) => {
        const trackingEvent = await tx.orderTrackingEvent.create({
          data: {
            orderId: order.id,
            status,
            note: note || null,
          },
        });

        const updated = await tx.order.update({
          where: { id: order.id },
          data: { status },
        });

        // Notify buyer of tracking update
        await tx.notification.create({
          data: {
            userId: order.buyerId,
            title: "Status Pengiriman Diperbarui",
            message: `Pesanan ${order.id} status: ${getStatusLabel(status)}${note ? `. Catatan: ${note}` : ""}`,
            type: "tracking",
          },
        });

        return { order: updated, trackingEvent };
      });

      return NextResponse.json({
        message: "Status pengiriman berhasil diperbarui",
        order: {
          id: updatedOrder.order.id,
          status: updatedOrder.order.status,
        },
        trackingEvent: {
          id: updatedOrder.trackingEvent.id,
          status: updatedOrder.trackingEvent.status,
          createdAt: updatedOrder.trackingEvent.createdAt,
        },
      });
    } catch (error: unknown) {
      console.error("Update tracking error:", error);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
  });
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    packed: "Dikemas",
    shipped: "Dalam Perjalanan",
    arrived: "Tiba di Kota",
    delivered: "Diterima",
  };
  return labels[status] || status;
}
