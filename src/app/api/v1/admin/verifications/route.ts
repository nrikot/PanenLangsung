import { NextRequest, NextResponse } from "next/server";
import { withRole } from "@/lib/middleware/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  return withRole(request, ["admin"], async () => {
    try {
      const { searchParams } = new URL(request.url);
      const status = searchParams.get("status") || "pending";
      const page = parseInt(searchParams.get("page") || "1");
      const limit = parseInt(searchParams.get("limit") || "20");
      const skip = (page - 1) * limit;

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where: { verificationStatus: status as "pending" | "verified" | "rejected" },
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            businessName: true,
            verificationStatus: true,
            createdAt: true,
            verificationDocuments: {
              select: {
                id: true,
                documentType: true,
                fileUrl: true,
                status: true,
                rejectionReason: true,
              },
            },
          },
          orderBy: { createdAt: "asc" },
          skip,
          take: limit,
        }),
        prisma.user.count({
          where: { verificationStatus: status as "pending" | "verified" | "rejected" },
        }),
      ]);

      return NextResponse.json({
        users,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error: unknown) {
      console.error("List verifications error:", error);
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 }
      );
    }
  });
}
