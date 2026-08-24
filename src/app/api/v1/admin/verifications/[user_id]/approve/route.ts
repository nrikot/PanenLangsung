import { NextRequest, NextResponse } from "next/server";
import { withRole } from "@/lib/middleware/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: { user_id: string } }
) {
  return withRole(request, ["admin"], async () => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: params.user_id },
      });

      if (!user) {
        return NextResponse.json(
          { error: "User tidak ditemukan" },
          { status: 404 }
        );
      }

      if (user.verificationStatus === "verified") {
        return NextResponse.json(
          { error: "User sudah terverifikasi" },
          { status: 400 }
        );
      }

      const [updatedUser] = await prisma.$transaction([
        prisma.user.update({
          where: { id: params.user_id },
          data: { verificationStatus: "verified" },
        }),
        prisma.verificationDocument.updateMany({
          where: { userId: params.user_id, status: "pending" },
          data: { status: "approved" },
        }),
        prisma.notification.create({
          data: {
            userId: params.user_id,
            title: "Verifikasi Disetujui",
            message: "Akun Anda telah berhasil diverifikasi. Anda dapat mulai bertransaksi.",
            type: "verification",
          },
        }),
      ]);

      return NextResponse.json({
        message: "User berhasil diverifikasi",
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          verificationStatus: updatedUser.verificationStatus,
        },
      });
    } catch (error: unknown) {
      console.error("Approve verification error:", error);
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 }
      );
    }
  });
}
