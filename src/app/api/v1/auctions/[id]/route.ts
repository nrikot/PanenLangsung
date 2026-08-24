import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/middleware/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auction = await prisma.auction.findUnique({
      where: { id: params.id },
      include: {
        farmer: { select: { id: true, name: true, businessName: true, phone: true, address: true, verificationStatus: true } },
        commodity: { select: { id: true, name: true } },
        bids: {
          orderBy: { createdAt: "desc" },
          select: { id: true, pricePerUnit: true, quantity: true, message: true, status: true, createdAt: true, buyer: { select: { id: true, name: true, businessName: true } } },
        },
      },
    });

    if (!auction) {
      return NextResponse.json({ error: "Lelang tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ auction });
  } catch (error: unknown) {
    console.error("Get auction error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(request, async (authUser) => {
    try {
      const auction = await prisma.auction.findUnique({ where: { id: params.id } });
      if (!auction) {
        return NextResponse.json({ error: "Lelang tidak ditemukan" }, { status: 404 });
      }
      if (auction.farmerId !== authUser.id && authUser.role !== "admin") {
        return NextResponse.json({ error: "Tidak memiliki akses" }, { status: 403 });
      }

      const body = await request.json();
      const { status } = body;

      if (status === "dibatalkan") {
        if (auction.status !== "draft" && auction.status !== "aktif") {
          return NextResponse.json({ error: "Hanya lelang draft/aktif yang bisa dibatalkan" }, { status: 400 });
        }
        const updated = await prisma.auction.update({
          where: { id: params.id },
          data: { status: "dibatalkan" },
        });
        return NextResponse.json({ message: "Lelang dibatalkan", auction: updated });
      }

      return NextResponse.json({ error: "Aksi tidak valid" }, { status: 400 });
    } catch (error: unknown) {
      console.error("Update auction error:", error);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
  });
}
