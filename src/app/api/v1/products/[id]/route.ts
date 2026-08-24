import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/middleware/auth";
import { prisma } from "@/lib/prisma";
import { UpdateProductSchema } from "@/lib/validations/product";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        farmer: {
          select: {
            id: true, name: true, businessName: true, phone: true,
            address: true, latitude: true, longitude: true,
            verificationStatus: true,
          },
        },
        commodity: { select: { id: true, name: true, category: { select: { name: true } } } },
        photos: { orderBy: { isPrimary: "desc" } },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Produk tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (error: unknown) {
    console.error("Get product error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(
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

      const body = await request.json();
      const { farmerId, ...rest } = body;
      const parsed = UpdateProductSchema.safeParse(rest);

      if (!parsed.success) {
        return NextResponse.json({ error: "Data tidak valid", details: parsed.error.flatten().fieldErrors }, { status: 400 });
      }

      const data = parsed.data;
      const updateData: Record<string, unknown> = {};
      if (data.commodityId !== undefined) updateData.commodityId = data.commodityId;
      if (data.title !== undefined) updateData.title = data.title;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.price !== undefined) updateData.price = data.price;
      if (data.unit !== undefined) updateData.unit = data.unit;
      if (data.grade !== undefined) updateData.grade = data.grade;
      if (data.quantityAvailable !== undefined) updateData.quantityAvailable = data.quantityAvailable;
      if (data.harvestDate !== undefined) updateData.harvestDate = data.harvestDate ? new Date(data.harvestDate) : null;
      if (data.isPreorder !== undefined) updateData.isPreorder = data.isPreorder;
      if (data.latitude !== undefined) updateData.latitude = data.latitude;
      if (data.longitude !== undefined) updateData.longitude = data.longitude;
      if (data.status !== undefined) updateData.status = data.status;

      if (authUser.role === "admin" && typeof farmerId === "string" && farmerId.length > 0) {
        updateData.farmerId = farmerId;
      }

      const updated = await prisma.product.update({
        where: { id: params.id },
        data: updateData,
        include: {
          commodity: { select: { name: true } },
          photos: true,
        },
      });

      return NextResponse.json({ message: "Produk diperbarui", product: updated });
    } catch (error: unknown) {
      console.error("Update product error:", error);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
  });
}

export async function DELETE(
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

      await prisma.product.delete({ where: { id: params.id } });

      return NextResponse.json({ message: "Produk berhasil dihapus" });
    } catch (error: unknown) {
      console.error("Delete product error:", error);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
  });
}
