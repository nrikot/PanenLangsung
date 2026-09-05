import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/middleware/auth";
import { prisma } from "@/lib/prisma";
import { CreateOrderSchema, OrderFilterSchema } from "@/lib/validations/order";

export async function GET(request: NextRequest) {
  return withAuth(request, async (authUser) => {
    try {
      const { searchParams } = new URL(request.url);
      const params = Object.fromEntries(searchParams.entries());

      const parsed = OrderFilterSchema.safeParse(params);
      if (!parsed.success) {
        return NextResponse.json(
          { error: "Parameter tidak valid", details: parsed.error.flatten().fieldErrors },
          { status: 400 }
        );
      }

      const { status, escrow_status, source_type, sort, page, limit } = parsed.data;
      const skip = (page - 1) * limit;

      const where: Record<string, unknown> = {};

      // Filter by role: farmers see orders where they are seller, buyers see their orders
      if (authUser.role === "petani") {
        where.sellerId = authUser.id;
      } else if (authUser.role === "pembeli") {
        where.buyerId = authUser.id;
      } else {
        // Admin sees all
      }

      if (status) where.status = status;
      if (escrow_status) where.escrowStatus = escrow_status;
      if (source_type) where.sourceType = source_type;

      const orderBy: Record<string, string> = {};
      switch (sort) {
        case "oldest":
          orderBy.createdAt = "asc";
          break;
        case "amount_asc":
          orderBy.totalAmount = "asc";
          break;
        case "amount_desc":
          orderBy.totalAmount = "desc";
          break;
        default:
          orderBy.createdAt = "desc";
      }

      const [orders, total] = await Promise.all([
        prisma.order.findMany({
          where,
          include: {
            buyer: { select: { id: true, name: true, businessName: true } },
            seller: { select: { id: true, name: true, businessName: true } },
            commodity: { select: { id: true, name: true } },
            escrowTransactions: { select: { id: true, status: true, amount: true } },
            trackingEvents: {
              orderBy: { createdAt: "desc" },
              take: 1,
              select: { status: true, createdAt: true },
            },
          },
          orderBy,
          skip,
          take: limit,
        }),
        prisma.order.count({ where }),
      ]);

      return NextResponse.json({
        orders,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error: unknown) {
      console.error("List orders error:", error);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
  });
}

export async function POST(request: NextRequest) {
  return withAuth(request, async (authUser) => {
    try {
      const body = await request.json();
      const parsed = CreateOrderSchema.safeParse(body);

      if (!parsed.success) {
        return NextResponse.json(
          { error: "Data tidak valid", details: parsed.error.flatten().fieldErrors },
          { status: 400 }
        );
      }

      const data = parsed.data;

      // Only buyers can create orders (or admin for special cases)
      if (authUser.role !== "pembeli" && authUser.role !== "admin") {
        return NextResponse.json(
          { error: "Hanya pembeli yang bisa membuat order" },
          { status: 403 }
        );
      }

      // Verify seller exists and is verified
      const seller = await prisma.user.findUnique({ where: { id: data.sellerId } });
      if (!seller || seller.role !== "petani") {
        return NextResponse.json({ error: "Penjual tidak ditemukan" }, { status: 404 });
      }
      if (seller.verificationStatus !== "verified") {
        return NextResponse.json(
          { error: "Penjual belum terverifikasi" },
          { status: 400 }
        );
      }

      // Verify buyer (self) is verified
      if (authUser.verificationStatus !== "verified") {
        return NextResponse.json(
          { error: "Akun Anda belum terverifikasi" },
          { status: 400 }
        );
      }

      // Verify commodity exists
      const commodity = await prisma.commodity.findUnique({
        where: { id: data.commodityId },
      });
      if (!commodity) {
        return NextResponse.json({ error: "Komoditas tidak ditemukan" }, { status: 404 });
      }

      // Calculate total amount
      const totalAmount = data.quantity * data.agreedPrice;

      // Create order with escrow transaction
      const order = await prisma.$transaction(async (tx) => {
        const newOrder = await tx.order.create({
          data: {
            buyerId: authUser.id,
            sellerId: data.sellerId,
            commodityId: data.commodityId,
            quantity: data.quantity,
            unit: data.unit,
            agreedPrice: data.agreedPrice,
            totalAmount,
            status: "negotiation",
            escrowStatus: "pending_payment",
            sourceType: data.sourceType || "direct",
            sourceId: data.sourceId || null,
          },
        });

        // Create pending escrow transaction
        await tx.escrowTransaction.create({
          data: {
            orderId: newOrder.id,
            buyerId: authUser.id,
            sellerId: data.sellerId,
            amount: totalAmount,
            paymentProvider: "midtrans",
            status: "pending_payment",
          },
        });

        // Create notification for seller
        await tx.notification.create({
          data: {
            userId: data.sellerId,
            title: "Order Baru",
            message: `Anda menerima order baru dari ${authUser.email} sebesar Rp ${totalAmount.toLocaleString("id-ID")}`,
            type: "order",
          },
        });

        return newOrder;
      });

      return NextResponse.json(
        {
          message: "Order berhasil dibuat",
          order: {
            id: order.id,
            totalAmount: order.totalAmount,
            status: order.status,
            escrowStatus: order.escrowStatus,
          },
        },
        { status: 201 }
      );
    } catch (error: unknown) {
      console.error("Create order error:", error);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
  });
}
