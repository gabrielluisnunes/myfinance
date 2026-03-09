import type { FastifyInstance } from "fastify";
import { authenticate } from "../../middlewares/authenticate";
import { sendCreated, sendSuccess } from "../../utils/response";
import {
  createGoalSchema,
  depositSchema,
  updateGoalSchema,
} from "./goals.schema";
import {
  createGoal,
  deleteGoal,
  depositToGoal,
  listGoals,
  updateGoal,
} from "./goals.service";

export async function goalsRoutes(app: FastifyInstance) {
  app.addHook("preHandler", authenticate);

  app.get("/", async (request, reply) => {
    const { sub: userId } = request.user as { sub: string };
    const goals = await listGoals(userId);
    return sendSuccess(reply, goals);
  });

  app.post("/", async (request, reply) => {
    const { sub: userId } = request.user as { sub: string };
    const input = createGoalSchema.parse(request.body);
    const goal = await createGoal(userId, input);
    return sendCreated(reply, goal);
  });

  app.patch("/:id", async (request, reply) => {
    const { sub: userId } = request.user as { sub: string };
    const { id } = request.params as { id: string };
    const input = updateGoalSchema.parse(request.body);
    const goal = await updateGoal(userId, id, input);
    return sendSuccess(reply, goal);
  });

  app.post("/:id/deposit", async (request, reply) => {
    const { sub: userId } = request.user as { sub: string };
    const { id } = request.params as { id: string };
    const input = depositSchema.parse(request.body);
    const goal = await depositToGoal(userId, id, input);
    return sendSuccess(reply, goal);
  });

  app.delete("/:id", async (request, reply) => {
    const { sub: userId } = request.user as { sub: string };
    const { id } = request.params as { id: string };
    await deleteGoal(userId, id);
    return sendSuccess(reply, null);
  });
}
