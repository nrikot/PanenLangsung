import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/middleware/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(request, async (authUser) => {
    if (authUser.role !== "pembeli") {
      return NextResponse.json({ error: "Hanya pembeli yang bisa memilih penawaran" }, { status: 403 });
    }

    try {
      const rfq = await prisma.rfq.findUnique({ where: { id: params.id } });
      if (!rfq) {
        return NextResponse.json({ error: "RFQ tidak ditemukan" }, { status: 404 });
      }
      if (rfq.buyerId !== authUser.id) {
        return NextResponse.json({ error: "Bukan RFQ Anda" }, { status: 403 });
      }
      if (rfq.status !== "open") {
        return NextResponse.json({ error: "RFQ sudah ditutup" }, { status: 400 });
      }

      const body = await request.json();
      const { quoteId } = body;

      if (!quoteId || typeof quoteId !== "string") {
        return NextResponse.json({ error: "quoteId wajib diisi" }, { status: 400 });
      }

      const quote = await prisma.rfqQuote.findUnique({ where: { id: quoteId } });
      if (!quote || quote.rfqId !== params.id) {
        return NextResponse.json({ error: "Penawaran tidak ditemukan" }, { status: 404 });
      }

      await prisma.$transaction([
        prisma.rfqQuote.update({ where: { id: quoteId }, data: { status: "accepted" } }),
        prisma.rfqQuote.updateMany({ where: { rfqId: params.id, id: { not: quoteId } }, data: { status: "declined" } }),
        prisma.rfq.update({ where: { id: params.id }, data: { status: "closed" } }),
      ]);

      return NextResponse.json({ message: "Penawaran berhasil dipilih", quoteId });
    } catch (error: unknown) {
      console.error("Select quote error:", error);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
  });
}
