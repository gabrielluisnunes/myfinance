import { prisma } from "@myfinance/db";
import type {
  CreateAccountInput,
  CreateCreditCardInput,
  UpdateAccountInput,
} from "./accounts.schema";

export async function listAccounts(userId: string) {
  return prisma.account.findMany({
    where: { userId, isActive: true },
    include: { creditCard: true },
    orderBy: { createdAt: "asc" },
  });
}

export async function getAccountById(userId: string, accountId: string) {
  const account = await prisma.account.findFirst({
    where: { id: accountId, userId },
    include: { creditCard: true },
  });

  if (!account) {
    throw { statusCode: 404, message: "Account not found" };
  }

  return account;
}

export async function createAccount(userId: string, input: CreateAccountInput) {
  return prisma.account.create({
    data: {
      userId,
      name: input.name,
      type: input.type,
      balance: input.balance,
      currency: input.currency,
    },
    include: { creditCard: true },
  });
}

export async function updateAccount(
  userId: string,
  accountId: string,
  input: UpdateAccountInput,
) {
  await getAccountById(userId, accountId);

  return prisma.account.update({
    where: { id: accountId },
    data: input,
    include: { creditCard: true },
  });
}

export async function deleteAccount(userId: string, accountId: string) {
  await getAccountById(userId, accountId);

  return prisma.account.update({
    where: { id: accountId },
    data: { isActive: false },
  });
}

export async function addCreditCard(
  userId: string,
  accountId: string,
  input: CreateCreditCardInput,
) {
  const account = await getAccountById(userId, accountId);

  if (account.type !== "CREDIT_CARD") {
    throw { statusCode: 400, message: "Account type must be CREDIT_CARD" };
  }

  if (account.creditCard) {
    throw {
      statusCode: 409,
      message: "Credit card already exists for this account",
    };
  }

  return prisma.creditCard.create({
    data: {
      accountId,
      limit: input.limit,
      closingDay: input.closingDay,
      dueDay: input.dueDay,
    },
  });
}
