import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/middleware/auth";
import { prisma } from "@/lib/prisma";
import { NotificationFilterSchema } from "@/lib/validations/notification";

export async function GET(request: NextRequest) {
  return withAuth(request, async (authUser) => {
    try {
      const { searchParams } = new URL(request.url);
      const params = Object.fromEntries(searchParams.entries());

      const parsed = NotificationFilterSchema.safeParse(params);
      if (!parsed.success) {
        return NextResponse.json(
          { error: "Parameter tidak valid", details: parsed.error.flatten().fieldErrors },
          { status: 400 }
        );
      }

      const { type, is_read, page, limit } = parsed.data;
      const skip = (page - 1) * limit;

      const where: Record<string, unknown> = {
        userId: authUser.id,
      };

      if (type) where.type = type;
      if (is_read !== undefined && is_read !== null) where.isRead = is_read;

      const [notifications, total, unreadCount] = await Promise.all([
        prisma.notification.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
        }),
        prisma.notification.count({ where }),
        prisma.notification.count({
          where: { userId: authUser.id, isRead: false },
        }),
      ]);

      return NextResponse.json({
        notifications,
        unreadCount,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error: unknown) {
      console.error("List notifications error:", error);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
  });
}
