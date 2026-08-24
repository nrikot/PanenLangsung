import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();

    // 1. Auto-activate auctions whose startTime has arrived
    const activated = await prisma.auction.updateMany({
      where: { status: "draft", startTime: { lte: now } },
      data: { status: "aktif" },
    });

    // 2. Close otomatis auctions that have ended
    const closed = await prisma.auction.updateMany({
      where: {
        status: "aktif",
        selectionMode: "otomatis",
        endTime: { lte: now },
      },
      data: { status: "berakhir" },
    });

    // 3. For each otomatis auction that just closed, select the winner (highest bid ≥ reserve)
    const endedOtomatis = await prisma.auction.findMany({
      where: {
        status: "berakhir",
        selectionMode: "otomatis",
        endTime: { lte: now },
      },
      include: {
        bids: { orderBy: { pricePerUnit: "desc" } },
      },
    });

    let winnersSelected = 0;

    for (const auction of endedOtomatis) {
      const validBids = auction.bids.filter((b) => b.pricePerUnit >= auction.reservePrice);

      if (validBids.length > 0) {
        const winner = validBids[0];

        await prisma.$transaction([
          prisma.auctionBid.update({ where: { id: winner.id }, data: { status: "accepted" } }),
          prisma.auctionBid.updateMany({
            where: { auctionId: auction.id, id: { not: winner.id } },
            data: { status: "declined" },
          }),
          prisma.auction.update({ where: { id: auction.id }, data: { status: "selesai" } }),
        ]);
        winnersSelected++;
      } else {
        // No valid bids — just close it
        await prisma.auction.update({ where: { id: auction.id }, data: { status: "berakhir" } });
      }
    }

    // 4. Close expired RFQs
    const rfqClosed = await prisma.rfq.updateMany({
      where: { status: "open", neededBy: { lte: now } },
      data: { status: "closed" },
    });

    return NextResponse.json({
      message: "Cron job completed",
      activated: activated.count,
      auctionClosed: closed.count,
      winnersSelected,
      rfqClosed: rfqClosed.count,
    });
  } catch (error: unknown) {
    console.error("Cron auction-close error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
