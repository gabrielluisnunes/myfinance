import { prisma } from "@myfinance/db";
import type { CreateBudgetInput, UpdateBudgetInput } from "./budgets.schema";

export async function listBudgets(userId: string, month: number, year: number) {
  const budgets = await prisma.budget.findMany({
    where: { userId, month, year },
    include: {
      category: { select: { id: true, name: true, color: true, icon: true } },
    },
    orderBy: { category: { name: "asc" } },
  });

  const budgetsWithSpent = await Promise.all(
    budgets.map(async (budget) => {
      const spent = await prisma.transaction.aggregate({
        where: {
          userId,
          categoryId: budget.categoryId,
          type: "EXPENSE",
          status: "CONFIRMED",
          date: {
            gte: new Date(Date.UTC(year, month - 1, 1)),
            lt: new Date(Date.UTC(year, month, 1)),
          },
        },
        _sum: { amount: true },
      });

      return {
        ...budget,
        spent: Number(spent._sum.amount ?? 0),
        remaining: Number(budget.amount) - Number(spent._sum.amount ?? 0),
      };
    }),
  );

  return budgetsWithSpent;
}

export async function createBudget(userId: string, input: CreateBudgetInput) {
  const existing = await prisma.budget.findUnique({
    where: {
      userId_categoryId_month_year: {
        userId,
        categoryId: input.categoryId,
        month: input.month,
        year: input.year,
      },
    },
  });

  if (existing) {
    throw {
      statusCode: 409,
      message: "Budget already exists for this category and period",
    };
  }

  return prisma.budget.create({
    data: { userId, ...input },
    include: {
      category: { select: { id: true, name: true, color: true, icon: true } },
    },
  });
}

export async function updateBudget(
  userId: string,
  budgetId: string,
  input: UpdateBudgetInput,
) {
  const budget = await prisma.budget.findFirst({
    where: { id: budgetId, userId },
  });

  if (!budget) throw { statusCode: 404, message: "Budget not found" };

  return prisma.budget.update({
    where: { id: budgetId },
    data: input,
    include: {
      category: { select: { id: true, name: true, color: true, icon: true } },
    },
  });
}

export async function deleteBudget(userId: string, budgetId: string) {
  const budget = await prisma.budget.findFirst({
    where: { id: budgetId, userId },
  });

  if (!budget) throw { statusCode: 404, message: "Budget not found" };

  await prisma.budget.delete({ where: { id: budgetId } });
}
