import { prisma } from "@myfinance/db";
import bcrypt from "bcryptjs";
import type { LoginInput, RegisterInput } from "./auth.schema";

export async function registerUser(input: RegisterInput) {
  const existingUser = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (existingUser) {
    throw { statusCode: 409, message: "Email already in use" };
  }

  const passwordHash = await bcrypt.hash(input.password, 12);

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      passwordHash,
    },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
    },
  });

  return user;
}

export async function validateCredentials(input: LoginInput) {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (!user) {
    throw { statusCode: 401, message: "Invalid credentials" };
  }

  const isPasswordValid = await bcrypt.compare(
    input.password,
    user.passwordHash,
  );

  if (!isPasswordValid) {
    throw { statusCode: 401, message: "Invalid credentials" };
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
}
