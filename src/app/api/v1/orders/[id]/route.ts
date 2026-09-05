import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/middleware/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(request, async (authUser) => {
    try {
      const order = await prisma.order.findUnique({
        where: { id: params.id },
        include: {
          buyer: { select: { id: true, name: true, email: true, businessName: true, phone: true } },
          seller: { select: { id: true, name: true, email: true, businessName: true, phone: true } },
          commodity: { select: { id: true, name: true, category: { select: { name: true } } } },
          escrowTransactions: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
          trackingEvents: {
            orderBy: { createdAt: "desc" },
          },
          reviews: {
            include: {
              reviewer: { select: { id: true, name: true } },
            },
          },
        },
      });

      if (!order) {
        return NextResponse.json({ error: "Order tidak ditemukan" }, { status: 404 });
      }

      // Only buyer, seller, or admin can view order details
      const isBuyer = order.buyerId === authUser.id;
      const isSeller = order.sellerId === authUser.id;
      const isAdmin = authUser.role === "admin";

      if (!isBuyer && !isSeller && !isAdmin) {
        return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
      }

      return NextResponse.json({ order });
    } catch (error: unknown) {
      console.error("Get order error:", error);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
  });
}
