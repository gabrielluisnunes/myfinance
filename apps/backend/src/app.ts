import fastifyHelmet from "@fastify/helmet";
import fastifyRateLimit from "@fastify/rate-limit";
import fastify from "fastify";
import { errorHandler } from "./middlewares/error-handler";
import { accountRoutes } from "./modules/accounts/accounts.controller";
import { analyticsRoutes } from "./modules/analytics/analytics.controller";
import { authRoutes } from "./modules/auth/auth.controller";
import { budgetRoutes } from "./modules/budgets/budgets.controller";
import { categoryRoutes } from "./modules/categories/categories.controller";
import { goalsRoutes } from "./modules/goals/goals.controller";
import { tagRoutes } from "./modules/tags/tags.controller";
import { transactionRoutes } from "./modules/transactions/transactions.controller";
import { transferRoutes } from "./modules/transfers/transfers.controller";
import { userRoutes } from "./modules/users/users.controller";
import { corsPlugin } from "./plugins/cors";
import { jwtPlugin } from "./plugins/jwt";

export function buildApp() {
  const app = fastify({
    logger: {
      level: process.env.NODE_ENV === "production" ? "warn" : "info",
    },
  });

  // Security headers (X-Frame-Options, HSTS, X-Content-Type-Options, etc.)
  app.register(fastifyHelmet, { contentSecurityPolicy: false });

  // Global rate limit — 200 req/min per IP (individual routes override this)
  app.register(fastifyRateLimit, {
    max: 200,
    timeWindow: "1 minute",
    errorResponseBuilder: (_req, context) => ({
      error: {
        code: "RATE_LIMITED",
        message: `Muitas requisições. Tente novamente em ${Math.ceil(context.ttl / 1000)} segundos.`,
      },
    }),
  });

  app.register(jwtPlugin);
  app.register(corsPlugin);

  app.setErrorHandler(errorHandler);

  app.register(authRoutes, { prefix: "/api/v1/auth" });
  app.register(userRoutes, { prefix: "/api/v1/users" });
  app.register(accountRoutes, { prefix: "/api/v1/accounts" });
  app.register(categoryRoutes, { prefix: "/api/v1/categories" });
  app.register(transactionRoutes, { prefix: "/api/v1/transactions" });
  app.register(transferRoutes, { prefix: "/api/v1/transfers" });
  app.register(budgetRoutes, { prefix: "/api/v1/budgets" });
  app.register(analyticsRoutes, { prefix: "/api/v1/analytics" });
  app.register(tagRoutes, { prefix: "/api/v1/tags" });
  app.register(goalsRoutes, { prefix: "/api/v1/goals" });

  app.get("/health", async () => ({ status: "ok" }));

  return app;
}
