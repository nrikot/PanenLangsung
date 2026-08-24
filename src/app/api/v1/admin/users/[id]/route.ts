import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/middleware/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(request, async (authUser) => {
    if (authUser.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const user = await prisma.user.findUnique({
      where: { id: params.id },
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
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ user });
  });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(request, async (authUser) => {
    if (authUser.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    try {
      const body = await request.json();
      const { name, phone, address, businessName, npwp, nib, businessType, groupFarmerNumber, verificationStatus } = body;

      const user = await prisma.user.update({
        where: { id: params.id },
        data: {
          ...(name !== undefined && { name }),
          ...(phone !== undefined && { phone }),
          ...(address !== undefined && { address }),
          ...(businessName !== undefined && { businessName }),
          ...(npwp !== undefined && { npwp }),
          ...(nib !== undefined && { nib }),
          ...(businessType !== undefined && { businessType }),
          ...(groupFarmerNumber !== undefined && { groupFarmerNumber }),
          ...(verificationStatus !== undefined && { verificationStatus }),
        },
        select: {
          id: true,
          email: true,
          role: true,
          name: true,
          phone: true,
          address: true,
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
      console.error("Admin update profile error:", error);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
  });
}
