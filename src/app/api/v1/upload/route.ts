import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/middleware/auth";
import { createServiceClient } from "@/lib/supabase/server";

const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
const MAX_SIZE = 2 * 1024 * 1024; // 2MB

export async function POST(request: NextRequest) {
  return withAuth(request, async (authUser) => {
    try {
      const formData = await request.formData();
      const file = formData.get("file") as File | null;
      const bucket = (formData.get("bucket") as string) || "documents";

      if (!file) {
        return NextResponse.json(
          { error: "File wajib diunggah" },
          { status: 400 }
        );
      }

      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json(
          {
            error: "Tipe file tidak diizinkan",
            message: "Hanya JPG, JPEG, PNG, dan PDF yang diperbolehkan",
          },
          { status: 400 }
        );
      }

      if (file.size > MAX_SIZE) {
        return NextResponse.json(
          {
            error: "Ukuran file terlalu besar",
            message: "Maksimal 2MB",
          },
          { status: 400 }
        );
      }

      const supabase = createServiceClient();
      const ext = file.name.split(".").pop();
      const fileName = `${authUser.id}/${Date.now()}.${ext}`;

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          contentType: file.type,
        });

      if (error) {
        return NextResponse.json(
          { error: "Upload gagal", message: error.message },
          { status: 500 }
        );
      }

      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

      return NextResponse.json({
        message: "File berhasil diunggah",
        url: urlData.publicUrl,
        path: data.path,
      });
    } catch (error: unknown) {
      console.error("Upload error:", error);
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 }
      );
    }
  });
}
