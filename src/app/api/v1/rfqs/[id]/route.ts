import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/middleware/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const rfq = await prisma.rfq.findUnique({
      where: { id: params.id },
      include: {
        buyer: { select: { id: true, name: true, businessName: true, phone: true, address: true, verificationStatus: true } },
        commodity: { select: { id: true, name: true } },
        quotes: {
          orderBy: { createdAt: "desc" },
          select: { id: true, pricePerUnit: true, quantity: true, message: true, status: true, createdAt: true, farmer: { select: { id: true, name: true, businessName: true } } },
        },
      },
    });

    if (!rfq) {
      return NextResponse.json({ error: "RFQ tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ rfq });
  } catch (error: unknown) {
    console.error("Get RFQ error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(request, async (authUser) => {
    try {
      const rfq = await prisma.rfq.findUnique({ where: { id: params.id } });
      if (!rfq) {
        return NextResponse.json({ error: "RFQ tidak ditemukan" }, { status: 404 });
      }
      if (rfq.buyerId !== authUser.id && authUser.role !== "admin") {
        return NextResponse.json({ error: "Tidak memiliki akses" }, { status: 403 });
      }

      const body = await request.json();
      const { status } = body;

      if (status === "cancelled") {
        if (rfq.status !== "open") {
          return NextResponse.json({ error: "Hanya RFQ open yang bisa dibatalkan" }, { status: 400 });
        }
        const updated = await prisma.rfq.update({ where: { id: params.id }, data: { status: "cancelled" } });
        return NextResponse.json({ message: "RFQ dibatalkan", rfq: updated });
      }

      return NextResponse.json({ error: "Aksi tidak valid" }, { status: 400 });
    } catch (error: unknown) {
      console.error("Update RFQ error:", error);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
  });
}
