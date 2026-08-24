import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { NearbySearchSchema } from "@/lib/validations/search";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());
    const parsed = NearbySearchSchema.safeParse(params);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Parameter tidak valid", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { lat, lng, radius_km, commodity_id, grade, min_price, max_price, type, page, limit } = parsed.data;
    const skip = (page - 1) * limit;

    // Bounding Box pre-filter (optimasi sebelum Haversine)
    const latDelta = radius_km / 111.0;
    const lngDelta = radius_km / (111.0 * Math.cos((lat * Math.PI) / 180));
    const minLat = lat - latDelta;
    const maxLat = lat + latDelta;
    const minLng = lng - lngDelta;
    const maxLng = lng + lngDelta;

    if (type === "product") {
      const where: Record<string, unknown> = {
        status: "aktif",
        latitude: { gte: minLat, lte: maxLat },
        longitude: { gte: minLng, lte: maxLng },
      };
      if (commodity_id) where.commodityId = commodity_id;
      if (grade) where.grade = grade;
      if (min_price != null || max_price != null) {
        where.price = {};
        if (min_price != null) (where.price as Record<string, number>).gte = min_price;
        if (max_price != null) (where.price as Record<string, number>).lte = max_price;
      }

      const [products, total] = await Promise.all([
        prisma.product.findMany({
          where,
          include: {
            farmer: { select: { id: true, name: true, businessName: true, verificationStatus: true } },
            commodity: { select: { id: true, name: true } },
            photos: { where: { isPrimary: true }, take: 1 },
          },
          skip,
          take: limit,
        }),
        prisma.product.count({ where }),
      ]);

      // Hitung jarak Haversine
      const results = products.map((p) => {
        const distance = haversineDistance(lat, lng, p.latitude, p.longitude);
        return { ...p, distance_km: Math.round(distance * 100) / 100 };
      }).sort((a, b) => a.distance_km - b.distance_km);

      return NextResponse.json({ results, type: "product", pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
    }

    if (type === "farmer" || type === "buyer") {
      const role = type === "farmer" ? "petani" : "pembeli";
      const where: Record<string, unknown> = {
        role,
        verificationStatus: "verified",
        latitude: { gte: minLat, lte: maxLat },
        longitude: { gte: minLng, lte: maxLng },
      };

      const users = await prisma.user.findMany({
        where,
        select: {
          id: true, name: true, businessName: true, phone: true,
          address: true, latitude: true, longitude: true,
          verificationStatus: true, role: true,
          ...(role === "petani" ? {
            products: {
              where: { status: "aktif" },
              take: 5,
              select: { id: true, title: true, price: true, unit: true, grade: true },
            },
          } : {}),
        },
        skip,
        take: limit,
      });

      const results = users.map((u) => {
        const distance = haversineDistance(lat, lng, u.latitude!, u.longitude!);
        return { ...u, distance_km: Math.round(distance * 100) / 100 };
      }).sort((a, b) => a.distance_km - b.distance_km);

      return NextResponse.json({ results, type, pagination: { page, limit } });
    }

    return NextResponse.json({ error: "Type harus product, farmer, atau buyer" }, { status: 400 });
  } catch (error: unknown) {
    console.error("Nearby search error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
