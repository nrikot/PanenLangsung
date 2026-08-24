import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/middleware/auth";
import { prisma } from "@/lib/prisma";
import { CreateAuctionSchema, AuctionFilterSchema } from "@/lib/validations/negotiation";

const SORT_MAP: Record<string, Record<string, string>> = {
  newest: { createdAt: "desc" },
  oldest: { createdAt: "asc" },
  price_asc: { startPrice: "asc" },
  price_desc: { startPrice: "desc" },
  ending_soon: { endTime: "asc" },
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());
    const parsed = AuctionFilterSchema.safeParse(params);

    if (!parsed.success) {
      return NextResponse.json({ error: "Parameter tidak valid", details: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const { commodity_id, status, sort, page, limit } = parsed.data;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (commodity_id) where.commodityId = commodity_id;

    const orderBy = SORT_MAP[sort] || SORT_MAP.newest;

    const [auctions, total] = await Promise.all([
      prisma.auction.findMany({
        where,
        include: {
          farmer: { select: { id: true, name: true, businessName: true } },
          commodity: { select: { id: true, name: true } },
          _count: { select: { bids: true } },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.auction.count({ where }),
    ]);

    return NextResponse.json({ auctions, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error: unknown) {
    console.error("List auctions error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  return withAuth(request, async (authUser) => {
    if (authUser.role !== "petani") {
      return NextResponse.json({ error: "Hanya petani yang bisa membuka lelang" }, { status: 403 });
    }

    const user = await prisma.user.findUnique({ where: { id: authUser.id }, select: { verificationStatus: true } });
    if (!user || user.verificationStatus !== "verified") {
      return NextResponse.json({ error: "Akun harus terverifikasi untuk membuka lelang" }, { status: 403 });
    }

    try {
      const body = await request.json();
      const parsed = CreateAuctionSchema.safeParse(body);

      if (!parsed.success) {
        return NextResponse.json({ error: "Data tidak valid", details: parsed.error.flatten().fieldErrors }, { status: 400 });
      }

      const d = parsed.data;
      const auction = await prisma.auction.create({
        data: {
          farmerId: authUser.id,
          commodityId: d.commodityId,
          title: d.title,
          quantity: d.quantity,
          unit: d.unit,
          startPrice: d.startPrice,
          reservePrice: d.reservePrice,
          startTime: new Date(d.startTime),
          endTime: new Date(d.endTime),
          selectionMode: d.selectionMode,
          status: new Date(d.startTime) <= new Date() ? "aktif" : "draft",
        },
        include: {
          commodity: { select: { name: true } },
        },
      });

      return NextResponse.json({ message: "Lelang berhasil dibuat", auction }, { status: 201 });
    } catch (error: unknown) {
      console.error("Create auction error:", error);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
  });
}
