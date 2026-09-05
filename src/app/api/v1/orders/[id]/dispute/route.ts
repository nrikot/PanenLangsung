import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/middleware/auth";
import { prisma } from "@/lib/prisma";
import { RaiseDisputeSchema } from "@/lib/validations/order";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(request, async (authUser) => {
    if (authUser.role !== "pembeli") {
      return NextResponse.json(
        { error: "Hanya pembeli yang bisa mengajukan sengketa" },
        { status: 403 }
      );
    }

    try {
      const order = await prisma.order.findUnique({
        where: { id: params.id },
      });

      if (!order) {
        return NextResponse.json({ error: "Order tidak ditemukan" }, { status: 404 });
      }

      if (order.buyerId !== authUser.id) {
        return NextResponse.json({ error: "Bukan order Anda" }, { status: 403 });
      }

      if (order.status !== "delivered") {
        return NextResponse.json(
          { error: "Hanya pesanan dengan status 'Diterima' yang bisa disengketakan" },
          { status: 400 }
        );
      }

      // Check 2x24h window
      const deliveredEvent = await prisma.orderTrackingEvent.findFirst({
        where: { orderId: order.id, status: "delivered" },
        orderBy: { createdAt: "desc" },
      });

      if (!deliveredEvent) {
        return NextResponse.json(
          { error: "Status pengiriman tidak ditemukan" },
          { status: 400 }
        );
      }

      const hoursSinceDelivery =
        (Date.now() - deliveredEvent.createdAt.getTime()) / (1000 * 60 * 60);
      if (hoursSinceDelivery > 48) {
        return NextResponse.json(
          { error: "Batas waktu pengajuan sengketa sudah lewat (maksimal 2x24 jam setelah penerimaan)" },
          { status: 400 }
        );
      }

      if (order.disputeStatus === "raised") {
        return NextResponse.json(
          { error: "Sengketa sudah diajukan untuk order ini" },
          { status: 400 }
        );
      }

      const body = await request.json();
      const parsed = RaiseDisputeSchema.safeParse(body);

      if (!parsed.success) {
        return NextResponse.json(
          { error: "Data tidak valid", details: parsed.error.flatten().fieldErrors },
          { status: 400 }
        );
      }

      // Update order dispute status and escrow status
      await prisma.$transaction(async (tx) => {
        await tx.order.update({
          where: { id: order.id },
          data: {
            disputeStatus: "raised",
            disputeReason: parsed.data.reason,
            escrowStatus: "disputed",
          },
        });

        // Update escrow transaction
        await tx.escrowTransaction.updateMany({
          where: { orderId: order.id, status: "paid_to_escrow" },
          data: { status: "disputed" },
        });

        // Notify seller
        await tx.notification.create({
          data: {
            userId: order.sellerId,
            title: "Sengketa Diajukan",
            message: `Pembeli mengajukan sengketa untuk pesanan ${order.id}. Alasan: ${parsed.data.reason}`,
            type: "dispute",
          },
        });

        // Notify admin
        const admins = await tx.user.findMany({ where: { role: "admin" } });
        for (const admin of admins) {
          await tx.notification.create({
            data: {
              userId: admin.id,
              title: "Sengketa Baru",
              message: `Sengketa diajukan untuk pesanan ${order.id}. Alasan: ${parsed.data.reason}`,
              type: "dispute",
            },
          });
        }
      });

      return NextResponse.json({
        message: "Sengketa berhasil diajukan",
        dispute: {
          orderId: order.id,
          status: "raised",
          reason: parsed.data.reason,
        },
      });
    } catch (error: unknown) {
      console.error("Raise dispute error:", error);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
  });
}
