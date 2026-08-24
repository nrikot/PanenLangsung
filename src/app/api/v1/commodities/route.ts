import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const commodities = await prisma.commodityCategory.findMany({
      include: { commodities: { orderBy: { name: "asc" } } },
      orderBy: { name: "asc" },
    });
    return NextResponse.json({ categories: commodities });
  } catch (error: unknown) {
    console.error("List categories error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
