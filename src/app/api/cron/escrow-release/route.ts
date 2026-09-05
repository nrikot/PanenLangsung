import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();
    const autoReleaseWindow = 2 * 24 * 60 * 60 * 1000; // 2x24 hours in ms

    // Find orders that are delivered and have paid escrow, with no dispute
    const eligibleOrders = await prisma.order.findMany({
      where: {
        status: "delivered",
        escrowStatus: "paid_to_escrow",
        disputeStatus: "none",
      },
      include: {
        trackingEvents: {
          where: { status: "delivered" },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        escrowTransactions: {
          where: { status: "paid_to_escrow" },
          take: 1,
        },
      },
    });

    let releasedCount = 0;
    const errors: string[] = [];

    for (const order of eligibleOrders) {
      if (order.trackingEvents.length === 0 || order.escrowTransactions.length === 0) {
        continue;
      }

      const deliveredAt = order.trackingEvents[0].createdAt;
      const timeSinceDelivery = now.getTime() - deliveredAt.getTime();

      // Only release if 2x24h have passed since delivery
      if (timeSinceDelivery < autoReleaseWindow) {
        continue;
      }

      const escrowTx = order.escrowTransactions[0];

      try {
        await prisma.$transaction(async (tx) => {
          // Update escrow transaction
          await tx.escrowTransaction.update({
            where: { id: escrowTx.id },
            data: {
              status: "released",
              releasedAmount: order.totalAmount,
              releasedAt: now,
            },
          });

          // Update order
          await tx.order.update({
            where: { id: order.id },
            data: { escrowStatus: "released" },
          });

          // Notify seller
          await tx.notification.create({
            data: {
              userId: order.sellerId,
              title: "Dana Dilepas",
              message: `Dana untuk order ${order.id} telah dilepas ke rekening Anda. Total: Rp ${order.totalAmount.toLocaleString("id-ID")}`,
              type: "escrow",
            },
          });

          // Notify buyer
          await tx.notification.create({
            data: {
              userId: order.buyerId,
              title: "Escrow Selesai",
              message: `Dana untuk order ${order.id} telah dilepas ke penjual.`,
              type: "escrow",
            },
          });
        });

        releasedCount++;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown error";
        errors.push(`Order ${order.id}: ${message}`);
        console.error(`Escrow release error for order ${order.id}:`, error);
      }
    }

    return NextResponse.json({
      message: "Escrow release cron job completed",
      eligibleOrders: eligibleOrders.length,
      released: releasedCount,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: unknown) {
    console.error("Escrow release cron error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
