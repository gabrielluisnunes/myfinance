import { prisma } from "@myfinance/db";
import type {
  CreateTransferInput,
  ListTransfersInput,
} from "./transfers.schema.js";

export async function listTransfers(
  userId: string,
  filters: ListTransfersInput,
) {
  const { page, limit, startDate, endDate } = filters;
  const skip = (page - 1) * limit;

  const where = {
    userId,
    ...(startDate || endDate
      ? {
          date: {
            ...(startDate ? { gte: new Date(startDate) } : {}),
            ...(endDate ? { lte: new Date(endDate) } : {}),
          },
        }
      : {}),
  };

  const [transfers, total] = await Promise.all([
    prisma.transfer.findMany({
      where,
      include: {
        fromAccount: { select: { id: true, name: true } },
        toAccount: { select: { id: true, name: true } },
      },
      orderBy: { date: "desc" },
      skip,
      take: limit,
    }),
    prisma.transfer.count({ where }),
  ]);

  return {
    data: transfers,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function createTransfer(
  userId: string,
  input: CreateTransferInput,
) {
  return prisma.$transaction(async (tx) => {
    const [fromAccount, toAccount] = await Promise.all([
      tx.account.findFirst({ where: { id: input.fromAccountId, userId } }),
      tx.account.findFirst({ where: { id: input.toAccountId, userId } }),
    ]);

    if (!fromAccount)
      throw { statusCode: 404, message: "Source account not found" };
    if (!toAccount)
      throw { statusCode: 404, message: "Destination account not found" };

    const transfer = await tx.transfer.create({
      data: {
        userId,
        fromAccountId: input.fromAccountId,
        toAccountId: input.toAccountId,
        amount: input.amount,
        description: input.description,
        date: new Date(input.date),
      },
      include: {
        fromAccount: { select: { id: true, name: true } },
        toAccount: { select: { id: true, name: true } },
      },
    });

    await tx.account.update({
      where: { id: input.fromAccountId },
      data: { balance: { decrement: input.amount } },
    });

    await tx.account.update({
      where: { id: input.toAccountId },
      data: { balance: { increment: input.amount } },
    });

    return transfer;
  });
}

export async function deleteTransfer(userId: string, transferId: string) {
  const transfer = await prisma.transfer.findFirst({
    where: { id: transferId, userId },
  });

  if (!transfer) throw { statusCode: 404, message: "Transfer not found" };

  return prisma.$transaction(async (tx) => {
    await tx.transfer.delete({ where: { id: transferId } });

    await tx.account.update({
      where: { id: transfer.fromAccountId },
      data: { balance: { increment: Number(transfer.amount) } },
    });

    await tx.account.update({
      where: { id: transfer.toAccountId },
      data: { balance: { decrement: Number(transfer.amount) } },
    });
  });
}
