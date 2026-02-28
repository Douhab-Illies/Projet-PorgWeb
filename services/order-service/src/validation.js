import { z } from "zod";

export const CreateOrderSchema = z.object({
  items: z.array(z.object({
    productId: z.string().min(1),
    quantity: z.number().int().positive().max(100)
  })).min(1)
});
