import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/middleware/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; messageId: string } }
) {
  return withAuth(request, async (authUser) => {
    try {
      const thread = await prisma.chatThread.findUnique({
        where: { id: params.id },
      });

      if (!thread) {
        return NextResponse.json({ error: "Thread tidak ditemukan" }, { status: 404 });
      }

      // Verify user is a participant
      if (thread.participant1Id !== authUser.id && thread.participant2Id !== authUser.id) {
        return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
      }

      // Find the counter-offer message
      const message = await prisma.chatMessage.findUnique({
        where: { id: params.messageId },
        include: {
          sender: { select: { id: true, name: true, email: true } },
        },
      });

      if (!message) {
        return NextResponse.json({ error: "Pesan tidak ditemukan" }, { status: 404 });
      }

      if (message.threadId !== params.id) {
        return NextResponse.json({ error: "Pesan bukan milik thread ini" }, { status: 400 });
      }

      if (message.type !== "counter_offer") {
        return NextResponse.json(
          { error: "Hanya counter offer yang bisa diterima" },
          { status: 400 }
        );
      }

      if (message.offerStatus !== "pending") {
        return NextResponse.json(
          { error: "Penawaran sudah diproses" },
          { status: 400 }
        );
      }

      // Only the other participant can accept (not the sender)
      if (message.senderId === authUser.id) {
        return NextResponse.json(
          { error: "Tidak bisa menerima penawaran sendiri" },
          { status: 400 }
        );
      }

      if (!message.offerPrice || !message.offerQuantity) {
        return NextResponse.json(
          { error: "Data penawaran tidak lengkap" },
          { status: 400 }
        );
      }

      // Accept the counter-offer and create order
      const result = await prisma.$transaction(async (tx) => {
        // Update message status
        const updatedMessage = await tx.chatMessage.update({
          where: { id: params.messageId },
          data: { offerStatus: "accepted" },
        });

        // Determine buyer and seller based on context
        // The sender of the counter-offer is typically the seller (farmer)
        // The acceptor is the buyer
        const buyerId = authUser.id;
        const sellerId = message.senderId;

        // Get commodity from context
        let commodityId: string | null = null;
        if (thread.contextType === "product") {
          const product = await tx.product.findUnique({
            where: { id: thread.contextId },
            select: { commodityId: true },
          });
          commodityId = product?.commodityId || null;
        } else if (thread.contextType === "auction") {
          const auction = await tx.auction.findUnique({
            where: { id: thread.contextId },
            select: { commodityId: true },
          });
          commodityId = auction?.commodityId || null;
        } else if (thread.contextType === "rfq") {
          const rfq = await tx.rfq.findUnique({
            where: { id: thread.contextId },
            select: { commodityId: true },
          });
          commodityId = rfq?.commodityId || null;
        }

        if (!commodityId) {
          throw new Error("Komoditas tidak ditemukan dari konteks");
        }

        if (!message.offerPrice || !message.offerQuantity) {
          throw new Error("Data penawaran tidak lengkap");
        }

        const totalAmount = message.offerPrice * message.offerQuantity;

        // Create order
        const order = await tx.order.create({
          data: {
            buyerId,
            sellerId,
            commodityId,
            quantity: message.offerQuantity,
            unit: "kg", // Default, can be refined
            agreedPrice: message.offerPrice,
            totalAmount,
            status: "negotiation",
            escrowStatus: "pending_payment",
            sourceType: "chat_offer",
            sourceId: message.id,
          },
        });

        // Create escrow transaction
        await tx.escrowTransaction.create({
          data: {
            orderId: order.id,
            buyerId,
            sellerId,
            amount: totalAmount,
            paymentProvider: "midtrans",
            status: "pending_payment",
          },
        });

        // Notify both parties
        await tx.notification.create({
          data: {
            userId: buyerId,
            title: "Order Dibuat dari Chat",
            message: `Order ${order.id} berhasil dibuat dari negosiasi chat. Total: Rp ${totalAmount.toLocaleString("id-ID")}`,
            type: "order",
          },
        });

        await tx.notification.create({
          data: {
            userId: sellerId,
            title: "Order Dibuat dari Chat",
            message: `Order ${order.id} berhasil dibuat dari negosiasi chat. Total: Rp ${totalAmount.toLocaleString("id-ID")}`,
            type: "order",
          },
        });

        return { order, message: updatedMessage };
      });

      return NextResponse.json({
        message: "Penawaran berhasil diterima. Order telah dibuat.",
        order: {
          id: result.order.id,
          totalAmount: result.order.totalAmount,
          status: result.order.status,
        },
        offerStatus: result.message.offerStatus,
      });
    } catch (error: unknown) {
      console.error("Accept counter-offer error:", error);
      const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
      return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
  });
}
