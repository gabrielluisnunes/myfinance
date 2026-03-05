import type { FastifyInstance } from "fastify";
import { authenticate } from "../../middlewares/authenticate";
import { sendCreated, sendSuccess } from "../../utils/response";
import {
  createTransactionSchema,
  listTransactionsSchema,
  updateTransactionSchema,
} from "./transactions.schema";
import {
  createTransaction,
  deleteTransaction,
  getTransactionById,
  listTransactions,
  updateTransaction,
} from "./transactions.service";

export async function transactionRoutes(app: FastifyInstance) {
  app.addHook("preHandler", authenticate);

  app.get("/", async (request, reply) => {
    const { sub: userId } = request.user as { sub: string };
    const filters = listTransactionsSchema.parse(request.query);
    const result = await listTransactions(userId, filters);
    return reply.status(200).send(result);
  });

  app.get("/:id", async (request, reply) => {
    const { sub: userId } = request.user as { sub: string };
    const { id } = request.params as { id: string };
    const transaction = await getTransactionById(userId, id);
    return sendSuccess(reply, transaction);
  });

  app.post("/", async (request, reply) => {
    const { sub: userId } = request.user as { sub: string };
    const input = createTransactionSchema.parse(request.body);
    const transaction = await createTransaction(userId, input);
    return sendCreated(reply, transaction);
  });

  app.patch("/:id", async (request, reply) => {
    const { sub: userId } = request.user as { sub: string };
    const { id } = request.params as { id: string };
    const input = updateTransactionSchema.parse(request.body);
    const transaction = await updateTransaction(userId, id, input);
    return sendSuccess(reply, transaction);
  });

  app.delete("/:id", async (request, reply) => {
    const { sub: userId } = request.user as { sub: string };
    const { id } = request.params as { id: string };
    await deleteTransaction(userId, id);
    return sendSuccess(reply, null);
  });
}
