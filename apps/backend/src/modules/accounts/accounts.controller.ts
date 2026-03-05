import type { FastifyInstance } from "fastify";
import { authenticate } from "../../middlewares/authenticate.js";
import { sendCreated, sendSuccess } from "../../utils/response.js";
import {
  createAccountSchema,
  createCreditCardSchema,
  updateAccountSchema,
} from "./accounts.schema.js";
import {
  addCreditCard,
  createAccount,
  deleteAccount,
  getAccountById,
  listAccounts,
  updateAccount,
} from "./accounts.service.js";

export async function accountRoutes(app: FastifyInstance) {
  app.addHook("preHandler", authenticate);

  app.get("/", async (request, reply) => {
    const { sub: userId } = request.user as { sub: string };
    const accounts = await listAccounts(userId);
    return sendSuccess(reply, accounts);
  });

  app.get("/:id", async (request, reply) => {
    const { sub: userId } = request.user as { sub: string };
    const { id } = request.params as { id: string };
    const account = await getAccountById(userId, id);
    return sendSuccess(reply, account);
  });

  app.post("/", async (request, reply) => {
    const { sub: userId } = request.user as { sub: string };
    const input = createAccountSchema.parse(request.body);
    const account = await createAccount(userId, input);
    return sendCreated(reply, account);
  });

  app.patch("/:id", async (request, reply) => {
    const { sub: userId } = request.user as { sub: string };
    const { id } = request.params as { id: string };
    const input = updateAccountSchema.parse(request.body);
    const account = await updateAccount(userId, id, input);
    return sendSuccess(reply, account);
  });

  app.delete("/:id", async (request, reply) => {
    const { sub: userId } = request.user as { sub: string };
    const { id } = request.params as { id: string };
    await deleteAccount(userId, id);
    return sendSuccess(reply, null);
  });

  app.post("/:id/credit-card", async (request, reply) => {
    const { sub: userId } = request.user as { sub: string };
    const { id } = request.params as { id: string };
    const input = createCreditCardSchema.parse(request.body);
    const creditCard = await addCreditCard(userId, id, input);
    return sendCreated(reply, creditCard);
  });
}
