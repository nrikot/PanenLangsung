import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/middleware/auth";
import { prisma } from "@/lib/prisma";
import { createServiceClient } from "@/lib/supabase/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; photoId: string } }
) {
  return withAuth(request, async (authUser) => {
    try {
      const product = await prisma.product.findUnique({ where: { id: params.id } });
      if (!product) {
        return NextResponse.json({ error: "Produk tidak ditemukan" }, { status: 404 });
      }
      if (product.farmerId !== authUser.id && authUser.role !== "admin") {
        return NextResponse.json({ error: "Tidak memiliki akses" }, { status: 403 });
      }

      const photo = await prisma.productPhoto.findUnique({ where: { id: params.photoId } });
      if (!photo || photo.productId !== params.id) {
        return NextResponse.json({ error: "Foto tidak ditemukan" }, { status: 404 });
      }

      const body = await request.json();
      const { isPrimary } = body;

      if (typeof isPrimary !== "boolean") {
        return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });
      }

      if (isPrimary) {
        await prisma.productPhoto.updateMany({
          where: { productId: params.id },
          data: { isPrimary: false },
        });
      }

      const updated = await prisma.productPhoto.update({
        where: { id: params.photoId },
        data: { isPrimary },
      });

      return NextResponse.json({ photo: updated });
    } catch (error: unknown) {
      console.error("Update photo error:", error);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; photoId: string } }
) {
  return withAuth(request, async (authUser) => {
    try {
      const product = await prisma.product.findUnique({ where: { id: params.id } });
      if (!product) {
        return NextResponse.json({ error: "Produk tidak ditemukan" }, { status: 404 });
      }
      if (product.farmerId !== authUser.id && authUser.role !== "admin") {
        return NextResponse.json({ error: "Tidak memiliki akses" }, { status: 403 });
      }

      const photo = await prisma.productPhoto.findUnique({ where: { id: params.photoId } });
      if (!photo || photo.productId !== params.id) {
        return NextResponse.json({ error: "Foto tidak ditemukan" }, { status: 404 });
      }

      if (photo.isPrimary) {
        const nextPhoto = await prisma.productPhoto.findFirst({
          where: { productId: params.id, id: { not: params.photoId } },
          orderBy: { createdAt: "asc" },
        });
        if (nextPhoto) {
          await prisma.productPhoto.update({ where: { id: nextPhoto.id }, data: { isPrimary: true } });
        }
      }

      const supabase = createServiceClient();
      if (photo.fileUrl && photo.fileUrl.includes("/storage/v1/object/public/products/")) {
        const path = photo.fileUrl.split("/storage/v1/object/public/products/")[1];
        if (path) {
          await supabase.storage.from("products").remove([path]);
        }
      }

      await prisma.productPhoto.delete({ where: { id: params.photoId } });

      return NextResponse.json({ message: "Foto berhasil dihapus" });
    } catch (error: unknown) {
      console.error("Delete photo error:", error);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
  });
}
