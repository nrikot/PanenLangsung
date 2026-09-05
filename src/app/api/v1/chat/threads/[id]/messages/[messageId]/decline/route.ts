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
      });

      if (!message) {
        return NextResponse.json({ error: "Pesan tidak ditemukan" }, { status: 404 });
      }

      if (message.threadId !== params.id) {
        return NextResponse.json({ error: "Pesan bukan milik thread ini" }, { status: 400 });
      }

      if (message.type !== "counter_offer") {
        return NextResponse.json(
          { error: "Hanya counter offer yang bisa ditolak" },
          { status: 400 }
        );
      }

      if (message.offerStatus !== "pending") {
        return NextResponse.json(
          { error: "Penawaran sudah diproses" },
          { status: 400 }
        );
      }

      // Only the other participant can decline (not the sender)
      if (message.senderId === authUser.id) {
        return NextResponse.json(
          { error: "Tidak bisa menolak penawaran sendiri" },
          { status: 400 }
        );
      }

      // Update message status
      const updatedMessage = await prisma.$transaction(async (tx) => {
        const msg = await tx.chatMessage.update({
          where: { id: params.messageId },
          data: { offerStatus: "declined" },
        });

        // Notify the sender that their offer was declined
        await tx.notification.create({
          data: {
            userId: message.senderId,
            title: "Penawaran Ditolak",
            message: `Penawaran Anda sebesar Rp ${(message.offerPrice || 0).toLocaleString("id-ID")} x ${message.offerQuantity} telah ditolak.`,
            type: "chat",
          },
        });

        return msg;
      });

      return NextResponse.json({
        message: "Penawaran berhasil ditolak",
        offerStatus: updatedMessage.offerStatus,
      });
    } catch (error: unknown) {
      console.error("Decline counter-offer error:", error);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
  });
}
