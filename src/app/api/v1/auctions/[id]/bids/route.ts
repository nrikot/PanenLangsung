import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/middleware/auth";
import { prisma } from "@/lib/prisma";
import { CreateBidSchema } from "@/lib/validations/negotiation";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(request, async (authUser) => {
    if (authUser.role !== "pembeli") {
      return NextResponse.json({ error: "Hanya pembeli yang bisa menawar" }, { status: 403 });
    }

    const user = await prisma.user.findUnique({ where: { id: authUser.id }, select: { verificationStatus: true } });
    if (!user || user.verificationStatus !== "verified") {
      return NextResponse.json({ error: "Akun harus terverifikasi untuk menawar" }, { status: 403 });
    }

    try {
      const auction = await prisma.auction.findUnique({ where: { id: params.id } });
      if (!auction) {
        return NextResponse.json({ error: "Lelang tidak ditemukan" }, { status: 404 });
      }
      if (auction.status !== "aktif") {
        return NextResponse.json({ error: "Lelang tidak aktif" }, { status: 400 });
      }
      if (new Date() > auction.endTime) {
        return NextResponse.json({ error: "Lelang sudah berakhir" }, { status: 400 });
      }

      const body = await request.json();
      const parsed = CreateBidSchema.safeParse(body);

      if (!parsed.success) {
        return NextResponse.json({ error: "Data tidak valid", details: parsed.error.flatten().fieldErrors }, { status: 400 });
      }

      const existing = await prisma.auctionBid.findFirst({
        where: { auctionId: params.id, buyerId: authUser.id },
      });

      let bid;
      if (existing) {
        bid = await prisma.auctionBid.update({
          where: { id: existing.id },
          data: {
            pricePerUnit: parsed.data.pricePerUnit,
            quantity: parsed.data.quantity,
            message: parsed.data.message,
          },
        });
      } else {
        bid = await prisma.auctionBid.create({
          data: {
            auctionId: params.id,
            buyerId: authUser.id,
            pricePerUnit: parsed.data.pricePerUnit,
            quantity: parsed.data.quantity,
            message: parsed.data.message,
          },
        });
      }

      return NextResponse.json({ message: "Penawaran berhasil dikirim", bid }, { status: 201 });
    } catch (error: unknown) {
      console.error("Create bid error:", error);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(request, async (authUser) => {
    try {
      const auction = await prisma.auction.findUnique({ where: { id: params.id }, select: { farmerId: true } });
      if (!auction) {
        return NextResponse.json({ error: "Lelang tidak ditemukan" }, { status: 404 });
      }

      const where: Record<string, unknown> = { auctionId: params.id };
      if (authUser.role === "pembeli") {
        where.buyerId = authUser.id;
      }

      const bids = await prisma.auctionBid.findMany({
        where,
        orderBy: { createdAt: "desc" },
        select: {
          id: true, pricePerUnit: true, quantity: true, message: true, status: true, createdAt: true,
          buyer: { select: { id: true, name: true, businessName: true } },
        },
      });

      return NextResponse.json({ bids });
    } catch (error: unknown) {
      console.error("List bids error:", error);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
  });
}
