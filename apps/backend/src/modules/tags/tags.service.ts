import { prisma } from "@myfinance/db";
import type { CreateTagInput, UpdateTagInput } from "./tags.schema.js";

export async function listTags(userId: string) {
  return prisma.tag.findMany({
    where: { userId },
    orderBy: { name: "asc" },
  });
}

export async function createTag(userId: string, input: CreateTagInput) {
  const existing = await prisma.tag.findUnique({
    where: { userId_name: { userId, name: input.name } },
  });

  if (existing) {
    throw { statusCode: 409, message: "Tag with this name already exists" };
  }

  return prisma.tag.create({ data: { userId, ...input } });
}

export async function updateTag(
  userId: string,
  tagId: string,
  input: UpdateTagInput,
) {
  const tag = await prisma.tag.findFirst({ where: { id: tagId, userId } });

  if (!tag) throw { statusCode: 404, message: "Tag not found" };

  return prisma.tag.update({ where: { id: tagId }, data: input });
}

export async function deleteTag(userId: string, tagId: string) {
  const tag = await prisma.tag.findFirst({ where: { id: tagId, userId } });

  if (!tag) throw { statusCode: 404, message: "Tag not found" };

  await prisma.tag.delete({ where: { id: tagId } });
}
