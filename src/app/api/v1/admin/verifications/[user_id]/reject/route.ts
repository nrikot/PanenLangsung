import { NextRequest, NextResponse } from "next/server";
import { withRole } from "@/lib/middleware/auth";
import { prisma } from "@/lib/prisma";
import { RejectVerificationSchema } from "@/lib/validations/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: { user_id: string } }
) {
  return withRole(request, ["admin"], async () => {
    try {
      const body = await request.json();
      const parsed = RejectVerificationSchema.safeParse(body);

      if (!parsed.success) {
        return NextResponse.json(
          {
            error: "Validation Error",
            details: parsed.error.flatten().fieldErrors,
          },
          { status: 400 }
        );
      }

      const user = await prisma.user.findUnique({
        where: { id: params.user_id },
      });

      if (!user) {
        return NextResponse.json(
          { error: "User tidak ditemukan" },
          { status: 404 }
        );
      }

      if (user.verificationStatus === "rejected") {
        return NextResponse.json(
          { error: "User sudah ditolak" },
          { status: 400 }
        );
      }

      const [updatedUser] = await prisma.$transaction([
        prisma.user.update({
          where: { id: params.user_id },
          data: { verificationStatus: "rejected" },
        }),
        prisma.verificationDocument.updateMany({
          where: { userId: params.user_id, status: "pending" },
          data: { status: "rejected", rejectionReason: parsed.data.reason },
        }),
        prisma.notification.create({
          data: {
            userId: params.user_id,
            title: "Verifikasi Ditolak",
            message: `Verifikasi akun Anda ditolak. Alasan: ${parsed.data.reason}`,
            type: "verification",
          },
        }),
      ]);

      return NextResponse.json({
        message: "User ditolak",
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          verificationStatus: updatedUser.verificationStatus,
        },
      });
    } catch (error: unknown) {
      console.error("Reject verification error:", error);
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 }
      );
    }
  });
}
