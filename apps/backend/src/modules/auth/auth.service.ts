import { prisma } from "@myfinance/db";
import bcrypt from "bcryptjs";
import type { LoginInput, RegisterInput } from "./auth.schema";

const DEFAULT_CATEGORIES = [
  // EXPENSE
  {
    name: "Groceries",
    type: "EXPENSE" as const,
    icon: "cart-outline",
    color: "#F59E0B",
  },
  {
    name: "Dining",
    type: "EXPENSE" as const,
    icon: "restaurant-outline",
    color: "#EF4444",
  },
  {
    name: "Transport",
    type: "EXPENSE" as const,
    icon: "car-outline",
    color: "#6366F1",
  },
  {
    name: "Shopping",
    type: "EXPENSE" as const,
    icon: "bag-outline",
    color: "#EC4899",
  },
  {
    name: "Rent",
    type: "EXPENSE" as const,
    icon: "home-outline",
    color: "#8B5CF6",
  },
  {
    name: "Health",
    type: "EXPENSE" as const,
    icon: "medkit-outline",
    color: "#10B981",
  },
  {
    name: "Entertainment",
    type: "EXPENSE" as const,
    icon: "film-outline",
    color: "#F97316",
  },
  {
    name: "Bills",
    type: "EXPENSE" as const,
    icon: "flash-outline",
    color: "#EAB308",
  },
  {
    name: "Education",
    type: "EXPENSE" as const,
    icon: "book-outline",
    color: "#3B82F6",
  },
  {
    name: "Others",
    type: "EXPENSE" as const,
    icon: "pricetag-outline",
    color: "#6B7280",
  },
  // INCOME
  {
    name: "Salary",
    type: "INCOME" as const,
    icon: "briefcase-outline",
    color: "#10B981",
  },
  {
    name: "Freelance",
    type: "INCOME" as const,
    icon: "laptop-outline",
    color: "#6366F1",
  },
  {
    name: "Investment",
    type: "INCOME" as const,
    icon: "trending-up-outline",
    color: "#F59E0B",
  },
  {
    name: "Gift",
    type: "INCOME" as const,
    icon: "gift-outline",
    color: "#EC4899",
  },
  {
    name: "Other Income",
    type: "INCOME" as const,
    icon: "wallet-outline",
    color: "#6B7280",
  },
];

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

  await prisma.category.createMany({
    data: DEFAULT_CATEGORIES.map((cat) => ({ ...cat, userId: user.id })),
  });

  await prisma.account.create({
    data: {
      userId: user.id,
      name: "Main Account",
      type: "CHECKING",
      balance: 0,
      currency: "BRL",
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
