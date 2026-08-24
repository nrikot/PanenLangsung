import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/middleware/auth";
import { prisma } from "@/lib/prisma";

const MAX_PHOTOS = 10;

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(request, async (authUser) => {
    if (authUser.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    try {
      const product = await prisma.product.findUnique({ where: { id: params.id } });
      if (!product) {
        return NextResponse.json({ error: "Produk tidak ditemukan" }, { status: 404 });
      }

      const body = await request.json();
      const { url } = body;

      if (!url || typeof url !== "string") {
        return NextResponse.json({ error: "URL wajib diisi" }, { status: 400 });
      }

      try {
        new URL(url);
      } catch {
        return NextResponse.json({ error: "URL tidak valid" }, { status: 400 });
      }

      const photoCount = await prisma.productPhoto.count({ where: { productId: params.id } });
      if (photoCount >= MAX_PHOTOS) {
        return NextResponse.json({ error: `Maksimal ${MAX_PHOTOS} foto per produk` }, { status: 400 });
      }

      const photo = await prisma.productPhoto.create({
        data: {
          productId: params.id,
          fileUrl: url,
          isPrimary: photoCount === 0,
        },
      });

      return NextResponse.json({ message: "Foto berhasil ditambahkan", photo }, { status: 201 });
    } catch (error: unknown) {
      console.error("Add photo by URL error:", error);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
  });
}
