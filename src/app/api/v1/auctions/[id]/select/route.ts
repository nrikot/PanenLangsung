import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/middleware/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(request, async (authUser) => {
    if (authUser.role !== "petani") {
      return NextResponse.json({ error: "Hanya petani yang bisa memilih pemenang" }, { status: 403 });
    }

    try {
      const auction = await prisma.auction.findUnique({ where: { id: params.id } });
      if (!auction) {
        return NextResponse.json({ error: "Lelang tidak ditemukan" }, { status: 404 });
      }
      if (auction.farmerId !== authUser.id) {
        return NextResponse.json({ error: "Bukan lelang Anda" }, { status: 403 });
      }
      if (auction.selectionMode !== "manual") {
        return NextResponse.json({ error: "Lelang ini menggunakan seleksi otomatis" }, { status: 400 });
      }
      if (auction.status !== "berakhir") {
        return NextResponse.json({ error: "Lelang belum berakhir" }, { status: 400 });
      }

      const body = await request.json();
      const { bidId } = body;

      if (!bidId || typeof bidId !== "string") {
        return NextResponse.json({ error: "bidId wajib diisi" }, { status: 400 });
      }

      const bid = await prisma.auctionBid.findUnique({ where: { id: bidId } });
      if (!bid || bid.auctionId !== params.id) {
        return NextResponse.json({ error: "Penawaran tidak ditemukan" }, { status: 404 });
      }

      await prisma.$transaction([
        prisma.auctionBid.update({ where: { id: bidId }, data: { status: "accepted" } }),
        prisma.auctionBid.updateMany({ where: { auctionId: params.id, id: { not: bidId } }, data: { status: "declined" } }),
        prisma.auction.update({ where: { id: params.id }, data: { status: "selesai" } }),
      ]);

      return NextResponse.json({ message: "Pemenang berhasil dipilih", bidId });
    } catch (error: unknown) {
      console.error("Select winner error:", error);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
  });
}
