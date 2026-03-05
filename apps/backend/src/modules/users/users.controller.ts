import type { FastifyInstance } from "fastify";
import { authenticate } from "../../middlewares/authenticate";
import { sendSuccess } from "../../utils/response";
import { updateUserSchema } from "./users.schema";
import { getUserById, updateUser } from "./users.service";

export async function userRoutes(app: FastifyInstance) {
  app.get("/me", { preHandler: authenticate }, async (request, reply) => {
    const { sub: userId } = request.user as { sub: string };
    const user = await getUserById(userId);
    return sendSuccess(reply, user);
  });

  app.patch("/me", { preHandler: authenticate }, async (request, reply) => {
    const { sub: userId } = request.user as { sub: string };
    const input = updateUserSchema.parse(request.body);
    const user = await updateUser(userId, input);
    return sendSuccess(reply, user);
  });
}
