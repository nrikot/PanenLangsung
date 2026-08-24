import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/middleware/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(request, async (authUser) => {
    try {
      const document = await prisma.verificationDocument.findFirst({
        where: {
          id: params.id,
          userId: authUser.id,
        },
      });

      if (!document) {
        return NextResponse.json(
          { error: "Dokumen tidak ditemukan" },
          { status: 404 }
        );
      }

      if (document.status !== "pending") {
        return NextResponse.json(
          { error: "Hanya dokumen dengan status pending yang bisa dihapus" },
          { status: 400 }
        );
      }

      await prisma.verificationDocument.delete({
        where: { id: params.id },
      });

      return NextResponse.json({ message: "Dokumen berhasil dihapus" });
    } catch (error: unknown) {
      console.error("Delete document error:", error);
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 }
      );
    }
  });
}
