import fastify from "fastify";
import { errorHandler } from "./middlewares/error-handler";
import { accountRoutes } from "./modules/accounts/accounts.controller";
import { authRoutes } from "./modules/auth/auth.controller";
import { budgetRoutes } from "./modules/budgets/budgets.controller";
import { categoryRoutes } from "./modules/categories/categories.controller";
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
