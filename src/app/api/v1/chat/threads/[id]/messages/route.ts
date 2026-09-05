import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/middleware/auth";
import { prisma } from "@/lib/prisma";
import { SendMessageSchema, MessageFilterSchema } from "@/lib/validations/chat";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
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

      const { searchParams } = new URL(request.url);
      const queryParams = Object.fromEntries(searchParams.entries());
      const parsed = MessageFilterSchema.safeParse(queryParams);

      if (!parsed.success) {
        return NextResponse.json(
          { error: "Parameter tidak valid", details: parsed.error.flatten().fieldErrors },
          { status: 400 }
        );
      }

      const { page, limit } = parsed.data;
      const skip = (page - 1) * limit;

      const [messages, total] = await Promise.all([
        prisma.chatMessage.findMany({
          where: { threadId: params.id },
          include: {
            sender: {
              select: { id: true, name: true, email: true, role: true },
            },
          },
          orderBy: { createdAt: "asc" },
          skip,
          take: limit,
        }),
        prisma.chatMessage.count({ where: { threadId: params.id } }),
      ]);

      return NextResponse.json({
        messages,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error: unknown) {
      console.error("List messages error:", error);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
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

      const body = await request.json();
      const parsed = SendMessageSchema.safeParse(body);

      if (!parsed.success) {
        return NextResponse.json(
          { error: "Data tidak valid", details: parsed.error.flatten().fieldErrors },
          { status: 400 }
        );
      }

      const { type, content, offerPrice, offerQuantity } = parsed.data;

      // Fetch user name for notification
      const dbUser = await prisma.user.findUnique({
        where: { id: authUser.id },
        select: { name: true },
      });
      const userName = dbUser?.name || authUser.email;

      const message = await prisma.$transaction(async (tx) => {
        const newMessage = await tx.chatMessage.create({
          data: {
            threadId: params.id,
            senderId: authUser.id,
            type,
            content: content || null,
            offerPrice: offerPrice || null,
            offerQuantity: offerQuantity || null,
            offerStatus: type === "counter_offer" ? "pending" : null,
          },
          include: {
            sender: {
              select: { id: true, name: true, email: true, role: true },
            },
          },
        });

        // Update thread timestamp
        await tx.chatThread.update({
          where: { id: params.id },
          data: { updatedAt: new Date() },
        });

        // Notify the other participant
        const otherParticipantId =
          thread.participant1Id === authUser.id
            ? thread.participant2Id
            : thread.participant1Id;

        const notificationMessage =
          type === "counter_offer"
            ? `${userName} mengirim penawaran: Rp ${(offerPrice || 0).toLocaleString("id-ID")} x ${offerQuantity}`
            : `${userName}: ${content?.substring(0, 50)}${(content?.length || 0) > 50 ? "..." : ""}`;

        await tx.notification.create({
          data: {
            userId: otherParticipantId,
            title: type === "counter_offer" ? "Penawaran Baru" : "Pesan Baru",
            message: notificationMessage,
            type: "chat",
          },
        });

        return newMessage;
      });

      return NextResponse.json(
        {
          message: "Pesan berhasil dikirim",
          chatMessage: message,
        },
        { status: 201 }
      );
    } catch (error: unknown) {
      console.error("Send message error:", error);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
  });
}
