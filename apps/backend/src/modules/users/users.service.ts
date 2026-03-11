import { prisma } from "@myfinance/db";
import bcrypt from "bcryptjs";
import type { UpdateUserInput } from "./users.schema";

export async function getUserById(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw { statusCode: 404, message: "User not found" };
  }

  return user;
}

export async function updateUser(userId: string, input: UpdateUserInput) {
  const { currentPassword, password, ...rest } = input;
  const updateData: { name?: string; passwordHash?: string } = { ...rest };

  if (password && currentPassword) {
    const existing = await prisma.user.findUnique({
      where: { id: userId },
      select: { passwordHash: true },
    });
    if (!existing) throw { statusCode: 404, message: "User not found" };

    const valid = await bcrypt.compare(currentPassword, existing.passwordHash);
    if (!valid)
      throw { statusCode: 401, message: "Current password is incorrect" };

    updateData.passwordHash = await bcrypt.hash(password, 12);
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: {
      id: true,
      name: true,
      email: true,
      updatedAt: true,
    },
  });

  return user;
}
