import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/middleware/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  return withAuth(request, async (authUser) => {
    if (authUser.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    try {
      const farmers = await prisma.user.findMany({
        where: { role: "petani" },
        select: { id: true, name: true, businessName: true },
        orderBy: { name: "asc" },
      });

      return NextResponse.json({ farmers });
    } catch (error: unknown) {
      console.error("List farmers error:", error);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
  });
}
