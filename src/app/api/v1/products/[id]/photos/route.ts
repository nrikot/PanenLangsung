import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/middleware/auth";
import { prisma } from "@/lib/prisma";
import { createServiceClient } from "@/lib/supabase/server";

const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png"];
const MAX_SIZE = 2 * 1024 * 1024;
const MAX_PHOTOS = 10;

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
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

      const photoCount = await prisma.productPhoto.count({ where: { productId: params.id } });
      if (photoCount >= MAX_PHOTOS) {
        return NextResponse.json({ error: `Maksimal ${MAX_PHOTOS} foto per produk` }, { status: 400 });
      }

      const formData = await request.formData();
      const file = formData.get("file") as File | null;

      if (!file) {
        return NextResponse.json({ error: "File wajib diunggah" }, { status: 400 });
      }

      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json({ error: "Hanya JPG/JPEG/PNG yang diperbolehkan" }, { status: 400 });
      }

      if (file.size > MAX_SIZE) {
        return NextResponse.json({ error: "Ukuran maksimal 2MB" }, { status: 400 });
      }

      const supabase = createServiceClient();
      const ext = file.name.split(".").pop();
      const fileName = `products/${params.id}/${Date.now()}.${ext}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("products")
        .upload(fileName, file, { contentType: file.type });

      if (uploadError) {
        return NextResponse.json({ error: "Upload gagal", message: uploadError.message }, { status: 500 });
      }

      const { data: urlData } = supabase.storage.from("products").getPublicUrl(uploadData.path);

      const isFirst = photoCount === 0;
      const photo = await prisma.productPhoto.create({
        data: {
          productId: params.id,
          fileUrl: urlData.publicUrl,
          isPrimary: isFirst,
        },
      });

      return NextResponse.json({ message: "Foto berhasil diunggah", photo }, { status: 201 });
    } catch (error: unknown) {
      console.error("Upload product photo error:", error);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
  });
}
