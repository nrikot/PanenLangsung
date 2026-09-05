import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/middleware/auth";
import { prisma } from "@/lib/prisma";
import { CreateReviewSchema } from "@/lib/validations/order";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(request, async (authUser) => {
    try {
      const order = await prisma.order.findUnique({
        where: { id: params.id },
        include: {
          escrowTransactions: { where: { status: "released" }, take: 1 },
        },
      });

      if (!order) {
        return NextResponse.json({ error: "Order tidak ditemukan" }, { status: 404 });
      }

      // Only buyer or seller of this order can review
      const isBuyer = order.buyerId === authUser.id;
      const isSeller = order.sellerId === authUser.id;

      if (!isBuyer && !isSeller) {
        return NextResponse.json({ error: "Bukan pesanan Anda" }, { status: 403 });
      }

      // Order must be delivered and escrow released
      if (order.status !== "delivered") {
        return NextResponse.json(
          { error: "Hanya pesanan selesai yang bisa diulas" },
          { status: 400 }
        );
      }

      if (order.escrowStatus !== "released") {
        return NextResponse.json(
          { error: "Escrow belum dilepas" },
          { status: 400 }
        );
      }

      const body = await request.json();
      const parsed = CreateReviewSchema.safeParse(body);

      if (!parsed.success) {
        return NextResponse.json(
          { error: "Data tidak valid", details: parsed.error.flatten().fieldErrors },
          { status: 400 }
        );
      }

      const { role, ratingFreshness, ratingSize, ratingQuality, ratingPayment, comment } = parsed.data;

      // Verify role matches user
      if (isBuyer && role !== "buyer") {
        return NextResponse.json(
          { error: "Anda adalah pembeli, role harus 'buyer'" },
          { status: 400 }
        );
      }
      if (isSeller && role !== "seller") {
        return NextResponse.json(
          { error: "Anda adalah penjual, role harus 'seller'" },
          { status: 400 }
        );
      }

      // Check if already reviewed
      const existingReview = await prisma.review.findUnique({
        where: {
          orderId_reviewerId: {
            orderId: order.id,
            reviewerId: authUser.id,
          },
        },
      });

      if (existingReview) {
        return NextResponse.json(
          { error: "Anda sudah memberikan ulasan untuk pesanan ini" },
          { status: 400 }
        );
      }

      // Create review
      const revieweeId = isBuyer ? order.sellerId : order.buyerId;

      const review = await prisma.review.create({
        data: {
          orderId: order.id,
          reviewerId: authUser.id,
          revieweeId,
          role,
          ratingFreshness: ratingFreshness || null,
          ratingSize: ratingSize || null,
          ratingQuality: ratingQuality || null,
          ratingPayment: ratingPayment || null,
          comment: comment || null,
        },
      });

      // Notify reviewee
      await prisma.notification.create({
        data: {
          userId: revieweeId,
          title: "Ulasan Baru",
          message: `Anda menerima ulasan baru dari ${isBuyer ? "pembeli" : "penjual"} untuk pesanan ${order.id}`,
          type: "review",
        },
      });

      return NextResponse.json(
        {
          message: "Ulasan berhasil dikirim",
          review: {
            id: review.id,
            role: review.role,
            ratingFreshness: review.ratingFreshness,
            ratingSize: review.ratingSize,
            ratingQuality: review.ratingQuality,
            ratingPayment: review.ratingPayment,
            comment: review.comment,
          },
        },
        { status: 201 }
      );
    } catch (error: unknown) {
      console.error("Create review error:", error);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
  });
}
