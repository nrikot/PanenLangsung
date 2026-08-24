import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/middleware/auth";
import { prisma } from "@/lib/prisma";
import { CreateRfqSchema, RfqFilterSchema } from "@/lib/validations/negotiation";

const SORT_MAP: Record<string, Record<string, string>> = {
  newest: { createdAt: "desc" },
  oldest: { createdAt: "asc" },
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());
    const parsed = RfqFilterSchema.safeParse(params);

    if (!parsed.success) {
      return NextResponse.json({ error: "Parameter tidak valid", details: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const { commodity_id, status, sort, page, limit } = parsed.data;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (commodity_id) where.commodityId = commodity_id;

    const orderBy = SORT_MAP[sort] || SORT_MAP.newest;

    const [rfqs, total] = await Promise.all([
      prisma.rfq.findMany({
        where,
        include: {
          buyer: { select: { id: true, name: true, businessName: true } },
          commodity: { select: { id: true, name: true } },
          _count: { select: { quotes: true } },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.rfq.count({ where }),
    ]);

    return NextResponse.json({ rfqs, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error: unknown) {
    console.error("List RFQs error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  return withAuth(request, async (authUser) => {
    if (authUser.role !== "pembeli") {
      return NextResponse.json({ error: "Hanya pembeli yang bisa membuat RFQ" }, { status: 403 });
    }

    const user = await prisma.user.findUnique({ where: { id: authUser.id }, select: { verificationStatus: true } });
    if (!user || user.verificationStatus !== "verified") {
      return NextResponse.json({ error: "Akun harus terverifikasi untuk membuat RFQ" }, { status: 403 });
    }

    try {
      const body = await request.json();
      const parsed = CreateRfqSchema.safeParse(body);

      if (!parsed.success) {
        return NextResponse.json({ error: "Data tidak valid", details: parsed.error.flatten().fieldErrors }, { status: 400 });
      }

      const d = parsed.data;
      const rfq = await prisma.rfq.create({
        data: {
          buyerId: authUser.id,
          commodityId: d.commodityId,
          quantity: d.quantity,
          unit: d.unit,
          targetPrice: d.targetPrice ?? null,
          deliveryLocation: d.deliveryLocation,
          neededBy: new Date(d.neededBy),
        },
        include: {
          commodity: { select: { name: true } },
        },
      });

      return NextResponse.json({ message: "RFQ berhasil dibuat", rfq }, { status: 201 });
    } catch (error: unknown) {
      console.error("Create RFQ error:", error);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
  });
}
