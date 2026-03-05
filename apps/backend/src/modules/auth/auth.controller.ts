import type { FastifyInstance } from "fastify";
import { sendCreated, sendSuccess } from "../../utils/response";
import { loginSchema, registerSchema } from "./auth.schema";
import { registerUser, validateCredentials } from "./auth.service";

export async function authRoutes(app: FastifyInstance) {
  app.post("/register", async (request, reply) => {
    const input = registerSchema.parse(request.body);
    const user = await registerUser(input);
    return sendCreated(reply, user);
  });

  app.post("/login", async (request, reply) => {
    const input = loginSchema.parse(request.body);
    const user = await validateCredentials(input);
    const token = app.jwt.sign({ sub: user.id, email: user.email });
    return sendSuccess(reply, { token, user });
  });
}
