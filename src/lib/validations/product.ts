import { z } from "zod";

export const ProductStatusEnum = z.enum(["aktif", "pre_order", "habis", "nonaktif"]);
export const UnitEnum = z.enum(["kg", "ikat", "ekor"]);
export const GradeEnum = z.enum(["A", "B", "C"]);

export const CreateProductSchema = z.object({
  commodityId: z.string().uuid("Komoditas wajib dipilih"),
  title: z.string().min(3, "Judul minimal 3 karakter").max(200),
  description: z.string().min(10, "Deskripsi minimal 10 karakter").max(2000),
  price: z.number().positive("Harga harus lebih dari 0"),
  unit: UnitEnum,
  grade: GradeEnum,
  quantityAvailable: z.number().positive("Kuantitas harus lebih dari 0"),
  harvestDate: z.string().optional().nullable(),
  isPreorder: z.boolean().default(false),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  status: ProductStatusEnum.default("aktif"),
});

export const UpdateProductSchema = CreateProductSchema.partial();

export const ProductFilterSchema = z.object({
  commodity_id: z.string().uuid().optional().nullable(),
  farmer_id: z.string().uuid().optional().nullable(),
  grade: GradeEnum.optional().nullable(),
  min_price: z.coerce.number().optional().nullable(),
  max_price: z.coerce.number().optional().nullable(),
  status: ProductStatusEnum.optional().nullable(),
  sort: z.enum(["newest", "oldest", "price_asc", "price_desc"]).optional().default("newest"),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});
