import { z } from "zod";

export const NotificationFilterSchema = z.object({
  type: z
    .enum([
      "verification",
      "chat",
      "order",
      "auction",
      "escrow",
      "tracking",
      "rfq",
      "review",
      "dispute",
      "system",
    ])
    .optional()
    .nullable(),
  is_read: z.coerce.boolean().optional().nullable(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});
