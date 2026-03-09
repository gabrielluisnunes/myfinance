import { z } from "zod";

export const createGoalSchema = z.object({
  name: z.string().min(1),
  targetAmount: z.number().positive(),
  savedAmount: z.number().min(0).optional().default(0),
  icon: z.string().optional(),
  color: z.string().optional(),
  deadline: z.string().datetime({ offset: true }).optional().nullable(),
});

export const updateGoalSchema = z.object({
  name: z.string().min(1).optional(),
  targetAmount: z.number().positive().optional(),
  icon: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
  deadline: z.string().datetime({ offset: true }).optional().nullable(),
  status: z.enum(["ACTIVE", "COMPLETED", "CANCELLED"]).optional(),
});

export const depositSchema = z.object({
  amount: z.number().positive(),
});

export type CreateGoalInput = z.infer<typeof createGoalSchema>;
export type UpdateGoalInput = z.infer<typeof updateGoalSchema>;
export type DepositInput = z.infer<typeof depositSchema>;
