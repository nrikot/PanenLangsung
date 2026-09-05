import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/middleware/auth";
import { prisma } from "@/lib/prisma";
import { CreateProductSchema, ProductFilterSchema } from "@/lib/validations/product";

const SORT_MAP: Record<string, Record<string, string>> = {
  newest: { createdAt: "desc" },
  oldest: { createdAt: "asc" },
  price_asc: { price: "asc" },
  price_desc: { price: "desc" },
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());
    const parsed = ProductFilterSchema.safeParse(params);

    if (!parsed.success) {
      return NextResponse.json({ error: "Parameter tidak valid", details: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const { commodity_id, farmer_id, grade, min_price, max_price, status, sort, page, limit } = parsed.data;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (commodity_id) where.commodityId = commodity_id;
    if (farmer_id) where.farmerId = farmer_id;
    if (grade) where.grade = grade;
    if (min_price != null || max_price != null) {
      where.price = {};
      if (min_price != null) (where.price as Record<string, number>).gte = min_price;
      if (max_price != null) (where.price as Record<string, number>).lte = max_price;
    }

    const orderBy = SORT_MAP[sort] || SORT_MAP.newest;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          farmer: { select: { id: true, name: true, email: true, businessName: true, verificationStatus: true } },
          commodity: { select: { id: true, name: true, category: { select: { name: true } } } },
          photos: { where: { isPrimary: true }, take: 1 },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({ products, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error: unknown) {
    console.error("List products error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  return withAuth(request, async (authUser) => {
    if (authUser.role !== "petani") {
      return NextResponse.json({ error: "Hanya petani yang bisa menambah produk" }, { status: 403 });
    }

    const user = await prisma.user.findUnique({ where: { id: authUser.id }, select: { verificationStatus: true } });
    if (!user || user.verificationStatus !== "verified") {
      return NextResponse.json({ error: "Akun harus terverifikasi untuk menambah produk" }, { status: 403 });
    }

    try {
      const body = await request.json();
      const parsed = CreateProductSchema.safeParse(body);

      if (!parsed.success) {
        return NextResponse.json({ error: "Data tidak valid", details: parsed.error.flatten().fieldErrors }, { status: 400 });
      }

      const data = parsed.data;
      const product = await prisma.product.create({
        data: {
          farmerId: authUser.id,
          commodityId: data.commodityId,
          title: data.title,
          description: data.description,
          price: data.price,
          unit: data.unit,
          grade: data.grade,
          quantityAvailable: data.quantityAvailable,
          harvestDate: data.harvestDate ? new Date(data.harvestDate) : null,
          isPreorder: data.isPreorder,
          latitude: data.latitude,
          longitude: data.longitude,
          status: data.status,
        },
        include: {
          commodity: { select: { name: true } },
          photos: true,
        },
      });

      return NextResponse.json({ message: "Produk berhasil dibuat", product }, { status: 201 });
    } catch (error: unknown) {
      console.error("Create product error:", error);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
  });
}
