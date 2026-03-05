import { prisma } from "@myfinance/db";
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
  const user = await prisma.user.update({
    where: { id: userId },
    data: input,
    select: {
      id: true,
      name: true,
      email: true,
      updatedAt: true,
    },
  });

  return user;
}
