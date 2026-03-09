import { z } from "zod";

export const createTransactionSchema = z.object({
  accountId: z.string().uuid(),
  categoryId: z.string().uuid(),
  invoiceId: z.string().uuid().optional(),
  type: z.enum(["INCOME", "EXPENSE"]),
  status: z.enum(["PENDING", "CONFIRMED"]).default("CONFIRMED"),
  amount: z.number().positive(),
  description: z.string().min(1).max(255),
  date: z.string().date(),
  notes: z.string().max(1000).optional(),
  tagIds: z.array(z.string().uuid()).optional(),
});

export const updateTransactionSchema = z.object({
  categoryId: z.string().uuid().optional(),
  invoiceId: z.string().uuid().nullable().optional(),
  status: z.enum(["PENDING", "CONFIRMED"]).optional(),
  amount: z.number().positive().optional(),
  description: z.string().min(1).max(255).optional(),
  date: z.string().date().optional(),
  notes: z.string().max(1000).nullable().optional(),
  tagIds: z.array(z.string().uuid()).optional(),
});

export const listTransactionsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(500).default(20),
  type: z.enum(["INCOME", "EXPENSE"]).optional(),
  status: z.enum(["PENDING", "CONFIRMED"]).optional(),
  accountId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
  startDate: z.string().date().optional(),
  endDate: z.string().date().optional(),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
export type ListTransactionsInput = z.infer<typeof listTransactionsSchema>;
