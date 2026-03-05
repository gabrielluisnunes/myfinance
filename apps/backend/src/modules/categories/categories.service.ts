import { prisma } from "@myfinance/db";
import type {
  CreateCategoryInput,
  UpdateCategoryInput,
} from "./categories.schema.js";

export async function listCategories(
  userId: string,
  type?: "INCOME" | "EXPENSE",
) {
  return prisma.category.findMany({
    where: {
      userId,
      isActive: true,
      ...(type ? { type } : {}),
    },
    orderBy: { name: "asc" },
  });
}

export async function getCategoryById(userId: string, categoryId: string) {
  const category = await prisma.category.findFirst({
    where: { id: categoryId, userId },
  });

  if (!category) {
    throw { statusCode: 404, message: "Category not found" };
  }

  return category;
}

export async function createCategory(
  userId: string,
  input: CreateCategoryInput,
) {
  return prisma.category.create({
    data: { userId, ...input },
  });
}

export async function updateCategory(
  userId: string,
  categoryId: string,
  input: UpdateCategoryInput,
) {
  await getCategoryById(userId, categoryId);

  return prisma.category.update({
    where: { id: categoryId },
    data: input,
  });
}

export async function deleteCategory(userId: string, categoryId: string) {
  await getCategoryById(userId, categoryId);

  return prisma.category.update({
    where: { id: categoryId },
    data: { isActive: false },
  });
}
