import fastify from "fastify";
import { errorHandler } from "./middlewares/error-handler.js";
import { authRoutes } from "./modules/auth/auth.controller.js";
import { userRoutes } from "./modules/users/users.controller.js";
import { corsPlugin } from "./plugins/cors.js";
import { jwtPlugin } from "./plugins/jwt.js";

export function buildApp() {
  const app = fastify({
    logger: {
      level: process.env.NODE_ENV === "production" ? "warn" : "info",
    },
  });

  app.register(jwtPlugin);
  app.register(corsPlugin);

  app.setErrorHandler(errorHandler);

  app.register(authRoutes, { prefix: "/api/v1/auth" });
  app.register(userRoutes, { prefix: "/api/v1/users" });

  app.get("/health", async () => ({ status: "ok" }));

  return app;
}
