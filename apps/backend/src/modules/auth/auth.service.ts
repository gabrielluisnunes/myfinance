import { prisma } from "@myfinance/db";
import bcrypt from "bcryptjs";
import { validateEmailDomain } from "../../utils/email-validator";
import type { LoginInput, RegisterInput } from "./auth.schema";

const DEFAULT_CATEGORIES = [
  // DESPESA
  {
    name: "Mercado",
    type: "EXPENSE" as const,
    icon: "cart-outline",
    color: "#F59E0B",
  },
  {
    name: "Restaurante",
    type: "EXPENSE" as const,
    icon: "restaurant-outline",
    color: "#EF4444",
  },
  {
    name: "Transporte",
    type: "EXPENSE" as const,
    icon: "car-outline",
    color: "#6366F1",
  },
  {
    name: "Compras",
    type: "EXPENSE" as const,
    icon: "bag-outline",
    color: "#EC4899",
  },
  {
    name: "Aluguel",
    type: "EXPENSE" as const,
    icon: "home-outline",
    color: "#8B5CF6",
  },
  {
    name: "Saúde",
    type: "EXPENSE" as const,
    icon: "medkit-outline",
    color: "#10B981",
  },
  {
    name: "Lazer",
    type: "EXPENSE" as const,
    icon: "film-outline",
    color: "#F97316",
  },
  {
    name: "Contas",
    type: "EXPENSE" as const,
    icon: "flash-outline",
    color: "#EAB308",
  },
  {
    name: "Educação",
    type: "EXPENSE" as const,
    icon: "book-outline",
    color: "#3B82F6",
  },
  {
    name: "Outros",
    type: "EXPENSE" as const,
    icon: "pricetag-outline",
    color: "#6B7280",
  },
  // RECEITA
  {
    name: "Salário",
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
    name: "Investimento",
    type: "INCOME" as const,
    icon: "trending-up-outline",
    color: "#F59E0B",
  },
  {
    name: "Presente",
    type: "INCOME" as const,
    icon: "gift-outline",
    color: "#EC4899",
  },
  {
    name: "Outras Receitas",
    type: "INCOME" as const,
    icon: "wallet-outline",
    color: "#6B7280",
  },
];

export async function registerUser(input: RegisterInput) {
  await validateEmailDomain(input.email);

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

// Pre-computed bcrypt hash used only for constant-time comparison when user is not found.
// Prevents user enumeration via response-time differences (timing attack mitigation).
const DUMMY_HASH =
  "$2b$12$LZp3a4FexM9kBzlUJYstJ.CK0KJCxP4nOBT3GkBN4t2mVNEQ0FzAi";

export async function validateCredentials(input: LoginInput) {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
    select: { id: true, name: true, email: true, passwordHash: true },
  });

  // Always run bcrypt.compare regardless of whether the user exists.
  // Comparing against DUMMY_HASH when user is absent keeps response time
  // constant, preventing attackers from enumerating valid email addresses.
  const isPasswordValid = await bcrypt.compare(
    input.password,
    user?.passwordHash ?? DUMMY_HASH,
  );

  if (!user || !isPasswordValid) {
    throw { statusCode: 401, message: "Invalid credentials" };
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
}
