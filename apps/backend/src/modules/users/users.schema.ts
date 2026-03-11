import { z } from "zod";

export const updateUserSchema = z
  .object({
    name: z.string().min(2).max(100).optional(),
    currentPassword: z.string().optional(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(100)
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .optional(),
  })
  .refine(
    (data) => {
      if (data.password && !data.currentPassword) return false;
      if (data.currentPassword && !data.password) return false;
      return true;
    },
    {
      message:
        "Both currentPassword and password are required to change password",
      path: ["currentPassword"],
    },
  );

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
