import type { FastifyInstance } from "fastify";
import { authenticate } from "../../middlewares/authenticate.js";
import { sendCreated, sendSuccess } from "../../utils/response.js";
import { createBudgetSchema, updateBudgetSchema } from "./budgets.schema.js";
import {
  createBudget,
  deleteBudget,
  listBudgets,
  updateBudget,
} from "./budgets.service.js";

export async function budgetRoutes(app: FastifyInstance) {
  app.addHook("preHandler", authenticate);

  app.get("/", async (request, reply) => {
    const { sub: userId } = request.user as { sub: string };
    const { month, year } = request.query as { month: string; year: string };

    const now = new Date();
    const parsedMonth = month ? Number(month) : now.getMonth() + 1;
    const parsedYear = year ? Number(year) : now.getFullYear();

    const budgets = await listBudgets(userId, parsedMonth, parsedYear);
    return sendSuccess(reply, budgets);
  });

  app.post("/", async (request, reply) => {
    const { sub: userId } = request.user as { sub: string };
    const input = createBudgetSchema.parse(request.body);
    const budget = await createBudget(userId, input);
    return sendCreated(reply, budget);
  });

  app.patch("/:id", async (request, reply) => {
    const { sub: userId } = request.user as { sub: string };
    const { id } = request.params as { id: string };
    const input = updateBudgetSchema.parse(request.body);
    const budget = await updateBudget(userId, id, input);
    return sendSuccess(reply, budget);
  });

  app.delete("/:id", async (request, reply) => {
    const { sub: userId } = request.user as { sub: string };
    const { id } = request.params as { id: string };
    await deleteBudget(userId, id);
    return sendSuccess(reply, null);
  });
}
