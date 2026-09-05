import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/middleware/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(request, async (authUser) => {
    try {
      const notification = await prisma.notification.findUnique({
        where: { id: params.id },
      });

      if (!notification) {
        return NextResponse.json({ error: "Notifikasi tidak ditemukan" }, { status: 404 });
      }

      if (notification.userId !== authUser.id) {
        return NextResponse.json({ error: "Bukan notifikasi Anda" }, { status: 403 });
      }

      const updated = await prisma.notification.update({
        where: { id: params.id },
        data: { isRead: true },
      });

      return NextResponse.json({
        message: "Notifikasi ditandai sudah dibaca",
        notification: updated,
      });
    } catch (error: unknown) {
      console.error("Mark notification read error:", error);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
  });
}
