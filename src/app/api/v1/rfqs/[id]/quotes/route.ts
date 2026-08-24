import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/middleware/auth";
import { prisma } from "@/lib/prisma";
import { CreateQuoteSchema } from "@/lib/validations/negotiation";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(request, async (authUser) => {
    if (authUser.role !== "petani") {
      return NextResponse.json({ error: "Hanya petani yang bisa mengirim penawaran" }, { status: 403 });
    }

    const user = await prisma.user.findUnique({ where: { id: authUser.id }, select: { verificationStatus: true } });
    if (!user || user.verificationStatus !== "verified") {
      return NextResponse.json({ error: "Akun harus terverifikasi untuk mengirim penawaran" }, { status: 403 });
    }

    try {
      const rfq = await prisma.rfq.findUnique({ where: { id: params.id } });
      if (!rfq) {
        return NextResponse.json({ error: "RFQ tidak ditemukan" }, { status: 404 });
      }
      if (rfq.status !== "open") {
        return NextResponse.json({ error: "RFQ tidak aktif" }, { status: 400 });
      }

      const body = await request.json();
      const parsed = CreateQuoteSchema.safeParse(body);

      if (!parsed.success) {
        return NextResponse.json({ error: "Data tidak valid", details: parsed.error.flatten().fieldErrors }, { status: 400 });
      }

      const existing = await prisma.rfqQuote.findFirst({
        where: { rfqId: params.id, farmerId: authUser.id },
      });

      let quote;
      if (existing) {
        quote = await prisma.rfqQuote.update({
          where: { id: existing.id },
          data: {
            pricePerUnit: parsed.data.pricePerUnit,
            quantity: parsed.data.quantity,
            message: parsed.data.message,
          },
        });
      } else {
        quote = await prisma.rfqQuote.create({
          data: {
            rfqId: params.id,
            farmerId: authUser.id,
            pricePerUnit: parsed.data.pricePerUnit,
            quantity: parsed.data.quantity,
            message: parsed.data.message,
          },
        });
      }

      return NextResponse.json({ message: "Penawaran berhasil dikirim", quote }, { status: 201 });
    } catch (error: unknown) {
      console.error("Create quote error:", error);
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
      const rfq = await prisma.rfq.findUnique({ where: { id: params.id }, select: { buyerId: true } });
      if (!rfq) {
        return NextResponse.json({ error: "RFQ tidak ditemukan" }, { status: 404 });
      }

      const where: Record<string, unknown> = { rfqId: params.id };
      if (authUser.role === "petani") {
        where.farmerId = authUser.id;
      }

      const quotes = await prisma.rfqQuote.findMany({
        where,
        orderBy: { createdAt: "desc" },
        select: {
          id: true, pricePerUnit: true, quantity: true, message: true, status: true, createdAt: true,
          farmer: { select: { id: true, name: true, businessName: true } },
        },
      });

      return NextResponse.json({ quotes });
    } catch (error: unknown) {
      console.error("List quotes error:", error);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
  });
}
