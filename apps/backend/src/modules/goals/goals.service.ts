import { prisma } from "@myfinance/db";
import type {
  CreateGoalInput,
  DepositInput,
  UpdateGoalInput,
} from "./goals.schema";

export async function listGoals(userId: string) {
  return prisma.goal.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function createGoal(userId: string, input: CreateGoalInput) {
  return prisma.goal.create({
    data: {
      userId,
      name: input.name,
      targetAmount: input.targetAmount,
      savedAmount: input.savedAmount ?? 0,
      icon: input.icon,
      color: input.color,
      deadline: input.deadline ? new Date(input.deadline) : null,
    },
  });
}

export async function updateGoal(
  userId: string,
  goalId: string,
  input: UpdateGoalInput,
) {
  const goal = await prisma.goal.findFirst({ where: { id: goalId, userId } });
  if (!goal) throw { statusCode: 404, message: "Goal not found" };

  return prisma.goal.update({
    where: { id: goalId },
    data: {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.targetAmount !== undefined && {
        targetAmount: input.targetAmount,
      }),
      ...(input.icon !== undefined && { icon: input.icon }),
      ...(input.color !== undefined && { color: input.color }),
      ...(input.deadline !== undefined && {
        deadline: input.deadline ? new Date(input.deadline) : null,
      }),
      ...(input.status !== undefined && { status: input.status }),
    },
  });
}

export async function depositToGoal(
  userId: string,
  goalId: string,
  input: DepositInput,
) {
  const goal = await prisma.goal.findFirst({ where: { id: goalId, userId } });
  if (!goal) throw { statusCode: 404, message: "Goal not found" };

  const newSaved = Number(goal.savedAmount) + input.amount;
  const reachedTarget = newSaved >= Number(goal.targetAmount);

  return prisma.goal.update({
    where: { id: goalId },
    data: {
      savedAmount: newSaved,
      status: reachedTarget ? "COMPLETED" : goal.status,
    },
  });
}

export async function deleteGoal(userId: string, goalId: string) {
  const goal = await prisma.goal.findFirst({ where: { id: goalId, userId } });
  if (!goal) throw { statusCode: 404, message: "Goal not found" };

  await prisma.goal.delete({ where: { id: goalId } });
}
