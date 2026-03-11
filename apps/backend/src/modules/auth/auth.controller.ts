import type { FastifyInstance } from "fastify";
import { sendCreated, sendSuccess } from "../../utils/response";
import { loginSchema, registerSchema } from "./auth.schema";
import { registerUser, validateCredentials } from "./auth.service";

export async function authRoutes(app: FastifyInstance) {
  // 5 registro attempts per 15 minutes per IP
  app.post(
    "/register",
    {
      config: {
        rateLimit: {
          max: 5,
          timeWindow: "15 minutes",
        },
      },
    },
    async (request, reply) => {
      const input = registerSchema.parse(request.body);
      const user = await registerUser(input);
      const token = app.jwt.sign({ sub: user.id, email: user.email });
      return sendCreated(reply, { token, user });
    },
  );

  // 10 login attempts per minute per IP
  app.post(
    "/login",
    {
      config: {
        rateLimit: {
          max: 10,
          timeWindow: "1 minute",
        },
      },
    },
    async (request, reply) => {
      const input = loginSchema.parse(request.body);
      const user = await validateCredentials(input);
      const token = app.jwt.sign({ sub: user.id, email: user.email });
      return sendSuccess(reply, { token, user });
    },
  );
}
