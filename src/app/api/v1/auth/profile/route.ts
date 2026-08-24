import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/middleware/auth";
import { prisma } from "@/lib/prisma";
import { UpdateProfileSchema } from "@/lib/validations/auth";

export async function PUT(request: NextRequest) {
  return withAuth(request, async (authUser) => {
    try {
      const body = await request.json();
      const parsed = UpdateProfileSchema.safeParse(body);

      if (!parsed.success) {
        return NextResponse.json(
          {
            error: "Validation Error",
            details: parsed.error.flatten().fieldErrors,
          },
          { status: 400 }
        );
      }

      const user = await prisma.user.update({
        where: { id: authUser.id },
        data: parsed.data,
        select: {
          id: true,
          email: true,
          role: true,
          name: true,
          phone: true,
          address: true,
          latitude: true,
          longitude: true,
          verificationStatus: true,
          businessName: true,
          npwp: true,
          nib: true,
          businessType: true,
          groupFarmerNumber: true,
          updatedAt: true,
        },
      });

      return NextResponse.json({ message: "Profil diperbarui", user });
    } catch (error: unknown) {
      console.error("Update profile error:", error);
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 }
      );
    }
  });
}
