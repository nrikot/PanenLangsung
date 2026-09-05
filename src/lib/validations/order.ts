import { z } from "zod";

export const OrderStatusEnum = z.enum([
  "negotiation",
  "confirmed",
  "packed",
  "shipped",
  "arrived",
  "delivered",
  "cancelled",
]);

export const EscrowStatusEnum = z.enum([
  "pending_payment",
  "paid_to_escrow",
  "released",
  "refunded",
  "disputed",
]);

export const OrderSourceTypeEnum = z.enum(["direct", "auction", "rfq", "chat_offer"]);

export const TrackingStatusEnum = z.enum(["packed", "shipped", "arrived", "delivered"]);

export const DisputeStatusEnum = z.enum(["none", "raised", "resolved"]);

export const UnitEnum = z.enum(["kg", "ikat", "ekor"]);

// ── Create Order ──
export const CreateOrderSchema = z.object({
  sellerId: z.string().min(1, "ID penjual wajib diisi"),
  commodityId: z.string().uuid("Pilih komoditas yang valid"),
  quantity: z.number().positive("Kuantitas harus lebih dari 0"),
  unit: UnitEnum,
  agreedPrice: z.number().positive("Harga yang disepakati harus lebih dari 0"),
  sourceType: OrderSourceTypeEnum.optional(),
  sourceId: z.string().optional(),
}).refine(
  (data) => {
    if (data.sourceType && data.sourceType !== "direct") {
      return !!data.sourceId;
    }
    return true;
  },
  {
    message: "sourceId wajib diisi untuk order dari lelang/RFQ/chat",
    path: ["sourceId"],
  }
);

// ── Order Filter ──
export const OrderFilterSchema = z.object({
  status: OrderStatusEnum.optional().nullable(),
  escrow_status: EscrowStatusEnum.optional().nullable(),
  source_type: OrderSourceTypeEnum.optional().nullable(),
  sort: z
    .enum(["newest", "oldest", "amount_asc", "amount_desc"])
    .optional()
    .default("newest"),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

// ── Tracking Update ──
export const UpdateTrackingSchema = z.object({
  status: TrackingStatusEnum,
  note: z.string().max(500, "Catatan maksimal 500 karakter").optional(),
});

// ── Dispute ──
export const RaiseDisputeSchema = z.object({
  reason: z
    .string()
    .min(10, "Alasan sengketa minimal 10 karakter")
    .max(1000, "Alasan sengketa maksimal 1000 karakter"),
});

// ── Resolve Dispute ──
export const ResolveDisputeSchema = z.object({
  resolution: z.enum(["release_to_seller", "refund_to_buyer", "partial"]),
  releaseAmount: z
    .number()
    .min(0, "Jumlah pencairan tidak boleh negatif")
    .optional(),
  refundAmount: z
    .number()
    .min(0, "Jumlah pengembalian tidak boleh negatif")
    .optional(),
  reason: z.string().max(500, "Alasan maksimal 500 karakter").optional(),
}).refine(
  (data) => {
    if (data.resolution === "partial") {
      return (
        data.releaseAmount !== undefined &&
        data.refundAmount !== undefined &&
        data.releaseAmount >= 0 &&
        data.refundAmount >= 0
      );
    }
    return true;
  },
  {
    message: "Jumlah pencairan dan pengembalian wajib diisi untuk resolusi parsial",
    path: ["releaseAmount"],
  }
);

// ── Review ──
export const CreateReviewSchema = z.object({
  role: z.enum(["buyer", "seller"]),
  ratingFreshness: z.number().int().min(1).max(5).optional(),
  ratingSize: z.number().int().min(1).max(5).optional(),
  ratingQuality: z.number().int().min(1).max(5).optional(),
  ratingPayment: z.number().int().min(1).max(5).optional(),
  comment: z.string().max(1000, "Komentar maksimal 1000 karakter").optional(),
}).refine(
  (data) => {
    if (data.role === "buyer") {
      return (
        data.ratingFreshness !== undefined ||
        data.ratingSize !== undefined ||
        data.ratingQuality !== undefined
      );
    }
    if (data.role === "seller") {
      return data.ratingPayment !== undefined;
    }
    return false;
  },
  {
    message: "Minimal satu rating wajib diisi",
    path: ["ratingFreshness"],
  }
);
