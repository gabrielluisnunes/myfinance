import type { FastifyInstance } from "fastify";
import { authenticate } from "../../middlewares/authenticate.js";
import { sendCreated, sendSuccess } from "../../utils/response.js";
import {
  createCategorySchema,
  updateCategorySchema,
} from "./categories.schema.js";
import {
  createCategory,
  deleteCategory,
  getCategoryById,
  listCategories,
  updateCategory,
} from "./categories.service.js";

export async function categoryRoutes(app: FastifyInstance) {
  app.addHook("preHandler", authenticate);

  app.get("/", async (request, reply) => {
    const { sub: userId } = request.user as { sub: string };
    const { type } = request.query as { type?: "INCOME" | "EXPENSE" };
    const categories = await listCategories(userId, type);
    return sendSuccess(reply, categories);
  });

  app.get("/:id", async (request, reply) => {
    const { sub: userId } = request.user as { sub: string };
    const { id } = request.params as { id: string };
    const category = await getCategoryById(userId, id);
    return sendSuccess(reply, category);
  });

  app.post("/", async (request, reply) => {
    const { sub: userId } = request.user as { sub: string };
    const input = createCategorySchema.parse(request.body);
    const category = await createCategory(userId, input);
    return sendCreated(reply, category);
  });

  app.patch("/:id", async (request, reply) => {
    const { sub: userId } = request.user as { sub: string };
    const { id } = request.params as { id: string };
    const input = updateCategorySchema.parse(request.body);
    const category = await updateCategory(userId, id, input);
    return sendSuccess(reply, category);
  });

  app.delete("/:id", async (request, reply) => {
    const { sub: userId } = request.user as { sub: string };
    const { id } = request.params as { id: string };
    await deleteCategory(userId, id);
    return sendSuccess(reply, null);
  });
}
