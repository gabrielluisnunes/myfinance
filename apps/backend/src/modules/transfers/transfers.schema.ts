import { z } from "zod";

export const createTransferSchema = z
  .object({
    fromAccountId: z.string().uuid(),
    toAccountId: z.string().uuid(),
    amount: z.number().positive(),
    description: z.string().max(255).optional(),
    date: z.string().date(),
  })
  .refine((data) => data.fromAccountId !== data.toAccountId, {
    message: "Source and destination accounts must be different",
    path: ["toAccountId"],
  });

export const listTransfersSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  startDate: z.string().date().optional(),
  endDate: z.string().date().optional(),
});

export type CreateTransferInput = z.infer<typeof createTransferSchema>;
export type ListTransfersInput = z.infer<typeof listTransfersSchema>;
