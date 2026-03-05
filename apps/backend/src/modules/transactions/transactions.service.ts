import { prisma } from "@myfinance/db";
import type {
  CreateTransactionInput,
  ListTransactionsInput,
  UpdateTransactionInput,
} from "./transactions.schema.js";

const transactionSelect = {
  id: true,
  type: true,
  status: true,
  amount: true,
  description: true,
  date: true,
  notes: true,
  createdAt: true,
  account: { select: { id: true, name: true, type: true } },
  category: { select: { id: true, name: true, color: true, icon: true } },
  invoice: { select: { id: true, month: true, year: true } },
  tags: { select: { tag: { select: { id: true, name: true, color: true } } } },
};

export async function listTransactions(
  userId: string,
  filters: ListTransactionsInput,
) {
  const {
    page,
    limit,
    type,
    status,
    accountId,
    categoryId,
    startDate,
    endDate,
  } = filters;
  const skip = (page - 1) * limit;

  const where = {
    userId,
    ...(type ? { type } : {}),
    ...(status ? { status } : {}),
    ...(accountId ? { accountId } : {}),
    ...(categoryId ? { categoryId } : {}),
    ...(startDate || endDate
      ? {
          date: {
            ...(startDate ? { gte: new Date(startDate) } : {}),
            ...(endDate ? { lte: new Date(endDate) } : {}),
          },
        }
      : {}),
  };

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      select: transactionSelect,
      orderBy: { date: "desc" },
      skip,
      take: limit,
    }),
    prisma.transaction.count({ where }),
  ]);

  return {
    data: transactions,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function getTransactionById(
  userId: string,
  transactionId: string,
) {
  const transaction = await prisma.transaction.findFirst({
    where: { id: transactionId, userId },
    select: transactionSelect,
  });

  if (!transaction) {
    throw { statusCode: 404, message: "Transaction not found" };
  }

  return transaction;
}

export async function createTransaction(
  userId: string,
  input: CreateTransactionInput,
) {
  const { tagIds, ...data } = input;

  return prisma.$transaction(async (tx) => {
    const transaction = await tx.transaction.create({
      data: {
        userId,
        accountId: data.accountId,
        categoryId: data.categoryId,
        invoiceId: data.invoiceId,
        type: data.type,
        status: data.status,
        amount: data.amount,
        description: data.description,
        date: new Date(data.date),
        notes: data.notes,
        ...(tagIds?.length
          ? {
              tags: {
                create: tagIds.map((tagId) => ({ tagId })),
              },
            }
          : {}),
      },
      select: transactionSelect,
    });

    if (data.status === "CONFIRMED") {
      const delta =
        data.type === "INCOME" ? Number(data.amount) : -Number(data.amount);
      await tx.account.update({
        where: { id: data.accountId },
        data: { balance: { increment: delta } },
      });
    }

    return transaction;
  });
}

export async function updateTransaction(
  userId: string,
  transactionId: string,
  input: UpdateTransactionInput,
) {
  const existing = await getTransactionById(userId, transactionId);
  const { tagIds, ...data } = input;

  return prisma.$transaction(async (tx) => {
    // Reverse previous balance effect if status was CONFIRMED
    if (existing.status === "CONFIRMED") {
      const reverseDelta =
        existing.type === "INCOME"
          ? -Number(existing.amount)
          : Number(existing.amount);
      await tx.account.update({
        where: { id: existing.account.id },
        data: { balance: { increment: reverseDelta } },
      });
    }

    const updated = await tx.transaction.update({
      where: { id: transactionId },
      data: {
        ...data,
        ...(data.date ? { date: new Date(data.date) } : {}),
        ...(tagIds !== undefined
          ? {
              tags: {
                deleteMany: {},
                create: tagIds.map((tagId) => ({ tagId })),
              },
            }
          : {}),
      },
      select: transactionSelect,
    });

    // Apply new balance effect if new status is CONFIRMED
    const newStatus = data.status ?? existing.status;
    const newAmount = data.amount ?? Number(existing.amount);
    const newType = existing.type;

    if (newStatus === "CONFIRMED") {
      const delta = newType === "INCOME" ? newAmount : -newAmount;
      await tx.account.update({
        where: { id: existing.account.id },
        data: { balance: { increment: delta } },
      });
    }

    return updated;
  });
}

export async function deleteTransaction(userId: string, transactionId: string) {
  const existing = await getTransactionById(userId, transactionId);

  return prisma.$transaction(async (tx) => {
    await tx.transaction.delete({ where: { id: transactionId } });

    if (existing.status === "CONFIRMED") {
      const reverseDelta =
        existing.type === "INCOME"
          ? -Number(existing.amount)
          : Number(existing.amount);
      await tx.account.update({
        where: { id: existing.account.id },
        data: { balance: { increment: reverseDelta } },
      });
    }
  });
}
