import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/middleware/auth";
import { prisma } from "@/lib/prisma";
import { CreateThreadSchema, ThreadFilterSchema } from "@/lib/validations/chat";

export async function GET(request: NextRequest) {
  return withAuth(request, async (authUser) => {
    try {
      const { searchParams } = new URL(request.url);
      const params = Object.fromEntries(searchParams.entries());

      const parsed = ThreadFilterSchema.safeParse(params);
      if (!parsed.success) {
        return NextResponse.json(
          { error: "Parameter tidak valid", details: parsed.error.flatten().fieldErrors },
          { status: 400 }
        );
      }

      const { context_type, search, page, limit } = parsed.data;
      const skip = (page - 1) * limit;

      const where: Record<string, unknown> = {
        OR: [
          { participant1Id: authUser.id },
          { participant2Id: authUser.id },
        ],
      };

      if (context_type) {
        where.contextType = context_type;
      }

      const [threads, total] = await Promise.all([
        prisma.chatThread.findMany({
          where,
          include: {
            participant1: {
              select: { id: true, name: true, email: true, businessName: true, role: true },
            },
            participant2: {
              select: { id: true, name: true, email: true, businessName: true, role: true },
            },
            messages: {
              orderBy: { createdAt: "desc" },
              take: 1,
              include: {
                sender: { select: { id: true, name: true } },
              },
            },
          },
          orderBy: { updatedAt: "desc" },
          skip,
          take: limit,
        }),
        prisma.chatThread.count({ where }),
      ]);

      // Filter by search term (participant name)
      let filteredThreads = threads;
      if (search) {
        const searchLower = search.toLowerCase();
        filteredThreads = threads.filter((t) => {
          const p1 = t.participant1;
          const p2 = t.participant2;
          return (
            p1.name.toLowerCase().includes(searchLower) ||
            p1.email.toLowerCase().includes(searchLower) ||
            p2.name.toLowerCase().includes(searchLower) ||
            p2.email.toLowerCase().includes(searchLower)
          );
        });
      }

      // Add unread count and other participant info
      const threadsWithMeta = await Promise.all(
        filteredThreads.map(async (thread) => {
          const otherParticipant =
            thread.participant1Id === authUser.id
              ? thread.participant2
              : thread.participant1;

          const unreadCount = await prisma.chatMessage.count({
            where: {
              threadId: thread.id,
              senderId: { not: authUser.id },
            },
          });

          return {
            id: thread.id,
            contextType: thread.contextType,
            contextId: thread.contextId,
            otherParticipant,
            lastMessage: thread.messages[0] || null,
            unreadCount,
            createdAt: thread.createdAt,
            updatedAt: thread.updatedAt,
          };
        })
      );

      return NextResponse.json({
        threads: threadsWithMeta,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error: unknown) {
      console.error("List threads error:", error);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
  });
}

export async function POST(request: NextRequest) {
  return withAuth(request, async (authUser) => {
    try {
      const body = await request.json();
      const parsed = CreateThreadSchema.safeParse(body);

      if (!parsed.success) {
        return NextResponse.json(
          { error: "Data tidak valid", details: parsed.error.flatten().fieldErrors },
          { status: 400 }
        );
      }

      const { participantId, contextType, contextId } = parsed.data;

      // Cannot chat with yourself
      if (participantId === authUser.id) {
        return NextResponse.json(
          { error: "Tidak bisa membuat chat dengan diri sendiri" },
          { status: 400 }
        );
      }

      // Verify participant exists
      const participant = await prisma.user.findUnique({
        where: { id: participantId },
        select: { id: true, name: true, role: true },
      });

      if (!participant) {
        return NextResponse.json(
          { error: "Peserta tidak ditemukan" },
          { status: 404 }
        );
      }

      // Verify context exists based on type
      await verifyContext(contextType, contextId);

      // Normalize participant order (smaller ID first) for unique constraint
      const [p1, p2] = [authUser.id, participantId].sort();

      // Check if thread already exists
      const existingThread = await prisma.chatThread.findUnique({
        where: {
          participant1Id_participant2Id_contextType_contextId: {
            participant1Id: p1,
            participant2Id: p2,
            contextType,
            contextId,
          },
        },
      });

      if (existingThread) {
        return NextResponse.json({
          message: "Thread sudah ada",
          thread: { id: existingThread.id },
        });
      }

      // Create new thread
      const thread = await prisma.chatThread.create({
        data: {
          participant1Id: p1,
          participant2Id: p2,
          contextType,
          contextId,
        },
        include: {
          participant1: {
            select: { id: true, name: true, email: true, businessName: true },
          },
          participant2: {
            select: { id: true, name: true, email: true, businessName: true },
          },
        },
      });

      return NextResponse.json(
        {
          message: "Thread berhasil dibuat",
          thread: {
            id: thread.id,
            contextType: thread.contextType,
            contextId: thread.contextId,
            participant1: thread.participant1,
            participant2: thread.participant2,
          },
        },
        { status: 201 }
      );
    } catch (error: unknown) {
      console.error("Create thread error:", error);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
  });
}

async function verifyContext(contextType: string, contextId: string) {
  switch (contextType) {
    case "product": {
      const product = await prisma.product.findUnique({ where: { id: contextId } });
      if (!product) throw new Error("Produk tidak ditemukan");
      break;
    }
    case "auction": {
      const auction = await prisma.auction.findUnique({ where: { id: contextId } });
      if (!auction) throw new Error("Lelang tidak ditemukan");
      break;
    }
    case "rfq": {
      const rfq = await prisma.rfq.findUnique({ where: { id: contextId } });
      if (!rfq) throw new Error("RFQ tidak ditemukan");
      break;
    }
    case "order": {
      const order = await prisma.order.findUnique({ where: { id: contextId } });
      if (!order) throw new Error("Order tidak ditemukan");
      break;
    }
  }
}
