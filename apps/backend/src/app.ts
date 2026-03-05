import fastify from "fastify";
import { errorHandler } from "./middlewares/error-handler.js";
import { accountRoutes } from "./modules/accounts/accounts.controller.js";
import { authRoutes } from "./modules/auth/auth.controller.js";
import { budgetRoutes } from "./modules/budgets/budgets.controller.js";
import { categoryRoutes } from "./modules/categories/categories.controller.js";
import { tagRoutes } from "./modules/tags/tags.controller.js";
import { transactionRoutes } from "./modules/transactions/transactions.controller.js";
import { transferRoutes } from "./modules/transfers/transfers.controller.js";
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
  app.register(accountRoutes, { prefix: "/api/v1/accounts" });
  app.register(categoryRoutes, { prefix: "/api/v1/categories" });
  app.register(transactionRoutes, { prefix: "/api/v1/transactions" });
  app.register(transferRoutes, { prefix: "/api/v1/transfers" });
  app.register(budgetRoutes, { prefix: "/api/v1/budgets" });
  app.register(tagRoutes, { prefix: "/api/v1/tags" });

  app.get("/health", async () => ({ status: "ok" }));

  return app;
}
