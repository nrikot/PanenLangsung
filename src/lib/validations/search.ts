import { z } from "zod";

export const NearbySearchSchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  radius_km: z.coerce.number().positive().default(50),
  commodity_id: z.string().uuid().optional().nullable(),
  grade: z.string().optional().nullable(),
  min_price: z.coerce.number().optional().nullable(),
  max_price: z.coerce.number().optional().nullable(),
  type: z.enum(["product", "farmer", "buyer"]).default("product"),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});
