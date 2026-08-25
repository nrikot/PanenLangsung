import { z } from "zod";

export const UnitEnum = z.enum(["kg", "ikat", "ekor"]);
export const AuctionSelectionModeEnum = z.enum(["otomatis", "manual"]);
export const AuctionStatusEnum = z.enum(["draft", "aktif", "berakhir", "dibatalkan", "selesai"]);
export const OfferStatusEnum = z.enum(["pending", "accepted", "declined"]);
export const RfqStatusEnum = z.enum(["open", "closed", "cancelled"]);

// ── Auction ──
export const CreateAuctionSchema = z.object({
  commodityId: z.string().uuid("Pilih komoditas yang valid"),
  title: z.string().min(3, "Judul lelang minimal 3 karakter").max(200, "Judul lelang maksimal 200 karakter"),
  quantity: z.number().positive("Kuantitas harus lebih dari 0"),
  unit: UnitEnum,
  startPrice: z.number().positive("Harga awal harus lebih dari 0"),
  reservePrice: z.number().positive("Harga minimal harus lebih dari 0"),
  startTime: z.string().min(1, "Waktu mulai wajib diisi"),
  endTime: z.string().min(1, "Waktu berakhir wajib diisi"),
  selectionMode: AuctionSelectionModeEnum.default("manual"),
}).refine((data) => new Date(data.endTime) > new Date(data.startTime), {
  message: "Waktu berakhir harus setelah waktu mulai",
  path: ["endTime"],
}).refine((data) => data.reservePrice >= data.startPrice, {
  message: "Harga minimal harus sama dengan atau lebih tinggi dari harga awal",
  path: ["reservePrice"],
});

export const CreateBidSchema = z.object({
  pricePerUnit: z.number().positive("Harga per satuan harus lebih dari 0"),
  quantity: z.number().positive("Kuantitas harus lebih dari 0"),
  message: z.string().max(500, "Pesan maksimal 500 karakter").optional(),
});

export const AuctionFilterSchema = z.object({
  commodity_id: z.string().uuid().optional().nullable(),
  status: AuctionStatusEnum.optional().nullable(),
  sort: z.enum(["newest", "oldest", "price_asc", "price_desc", "ending_soon"]).optional().default("newest"),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

// ── RFQ ──
export const CreateRfqSchema = z.object({
  commodityId: z.string().uuid("Pilih komoditas yang valid"),
  quantity: z.number().positive("Kuantitas harus lebih dari 0"),
  unit: UnitEnum,
  targetPrice: z.number().positive("Harga target harus lebih dari 0").optional().nullable(),
  deliveryLocation: z.string().min(5, "Lokasi pengiriman minimal 5 karakter").max(500, "Lokasi pengiriman maksimal 500 karakter"),
  neededBy: z.string().min(1, "Tanggal kebutuhan wajib diisi"),
});

export const CreateQuoteSchema = z.object({
  pricePerUnit: z.number().positive("Harga per satuan harus lebih dari 0"),
  quantity: z.number().positive("Kuantitas harus lebih dari 0"),
  message: z.string().max(500, "Pesan maksimal 500 karakter").optional(),
});

export const RfqFilterSchema = z.object({
  commodity_id: z.string().uuid().optional().nullable(),
  status: RfqStatusEnum.optional().nullable(),
  sort: z.enum(["newest", "oldest"]).optional().default("newest"),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});
