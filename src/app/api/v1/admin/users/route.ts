import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/middleware/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const UserListSchema = z.object({
  role: z.enum(["petani", "pembeli"]).optional(),
  status: z.enum(["pending", "verified", "rejected"]).optional(),
  search: z.string().optional(),
  sort: z.enum(["newest", "oldest", "name_asc", "name_desc"]).optional().default("newest"),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

const SORT_MAP: Record<string, Record<string, string>> = {
  newest: { createdAt: "desc" },
  oldest: { createdAt: "asc" },
  name_asc: { name: "asc" },
  name_desc: { name: "desc" },
};

export async function GET(request: NextRequest) {
  return withAuth(request, async (authUser) => {
    if (authUser.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    try {
      const { searchParams } = new URL(request.url);
      const params = Object.fromEntries(searchParams.entries());
      const parsed = UserListSchema.safeParse(params);

      if (!parsed.success) {
        return NextResponse.json({ error: "Parameter tidak valid", details: parsed.error.flatten().fieldErrors }, { status: 400 });
      }

      const { role, status, search, sort, page, limit } = parsed.data;
      const skip = (page - 1) * limit;

      const where: Record<string, unknown> = {};
      if (role) where.role = role;
      if (status) where.verificationStatus = status;
      if (search) {
        where.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
          { businessName: { contains: search, mode: "insensitive" } },
          { phone: { contains: search, mode: "insensitive" } },
        ];
      }

      const orderBy = SORT_MAP[sort] || SORT_MAP.newest;

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          select: {
            id: true,
            email: true,
            name: true,
            phone: true,
            businessName: true,
            verificationStatus: true,
            createdAt: true,
            _count: {
              select: {
                products: true,
                auctions: true,
                rfqs: true,
                ordersAsBuyer: true,
                ordersAsSeller: true,
              },
            },
          },
          orderBy,
          skip,
          take: limit,
        }),
        prisma.user.count({ where }),
      ]);

      return NextResponse.json({ users, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
    } catch (error: unknown) {
      console.error("List users error:", error);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
  });
}
