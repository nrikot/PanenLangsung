import { z } from "zod";

export const ChatContextTypeEnum = z.enum(["product", "auction", "rfq", "order"]);
export const ChatMessageTypeEnum = z.enum(["text", "counter_offer"]);
export const OfferStatusEnum = z.enum(["pending", "accepted", "declined"]);

// ── Create Thread ──
export const CreateThreadSchema = z.object({
  participantId: z.string().min(1, "ID peserta wajib diisi"),
  contextType: ChatContextTypeEnum,
  contextId: z.string().uuid("ID konteks tidak valid"),
});

// ── Send Message ──
export const SendMessageSchema = z.object({
  type: ChatMessageTypeEnum.default("text"),
  content: z.string().max(2000, "Pesan maksimal 2000 karakter").optional(),
  offerPrice: z.number().positive("Harga tawaran harus lebih dari 0").optional(),
  offerQuantity: z.number().positive("Kuantitas tawaran harus lebih dari 0").optional(),
}).refine(
  (data) => {
    if (data.type === "text") {
      return !!data.content && data.content.trim().length > 0;
    }
    if (data.type === "counter_offer") {
      return data.offerPrice !== undefined && data.offerQuantity !== undefined;
    }
    return false;
  },
  {
    message: "Pesan teks wajib diisi. Counter offer wajib memiliki harga dan kuantitas.",
    path: ["content"],
  }
);

// ── Thread Filter ──
export const ThreadFilterSchema = z.object({
  context_type: ChatContextTypeEnum.optional().nullable(),
  search: z.string().max(100).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

// ── Message Filter ──
export const MessageFilterSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
});
