import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/middleware/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  return withAuth(request, async (authUser) => {
    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
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
        createdAt: true,
        updatedAt: true,
        userCommodities: {
          include: { commodity: { select: { id: true, name: true } } },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({ user });
  });
}
