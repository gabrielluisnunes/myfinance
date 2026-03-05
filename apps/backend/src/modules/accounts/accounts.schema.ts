import { z } from "zod";

export const createAccountSchema = z.object({
  name: z.string().min(2).max(100),
  type: z.enum(["CHECKING", "SAVINGS", "CASH", "CREDIT_CARD", "INVESTMENT"]),
  balance: z.number().default(0),
  currency: z.string().length(3).default("BRL"),
});

export const updateAccountSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  isActive: z.boolean().optional(),
});

export const createCreditCardSchema = z.object({
  limit: z.number().positive(),
  closingDay: z.number().int().min(1).max(31),
  dueDay: z.number().int().min(1).max(31),
});

export type CreateAccountInput = z.infer<typeof createAccountSchema>;
export type UpdateAccountInput = z.infer<typeof updateAccountSchema>;
export type CreateCreditCardInput = z.infer<typeof createCreditCardSchema>;
