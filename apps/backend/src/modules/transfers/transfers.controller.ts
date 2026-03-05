import type { FastifyInstance } from "fastify";
import { authenticate } from "../../middlewares/authenticate.js";
import { sendCreated, sendSuccess } from "../../utils/response.js";
import {
  createTransferSchema,
  listTransfersSchema,
} from "./transfers.schema.js";
import {
  createTransfer,
  deleteTransfer,
  listTransfers,
} from "./transfers.service.js";

export async function transferRoutes(app: FastifyInstance) {
  app.addHook("preHandler", authenticate);

  app.get("/", async (request, reply) => {
    const { sub: userId } = request.user as { sub: string };
    const filters = listTransfersSchema.parse(request.query);
    const result = await listTransfers(userId, filters);
    return reply.status(200).send(result);
  });

  app.post("/", async (request, reply) => {
    const { sub: userId } = request.user as { sub: string };
    const input = createTransferSchema.parse(request.body);
    const transfer = await createTransfer(userId, input);
    return sendCreated(reply, transfer);
  });

  app.delete("/:id", async (request, reply) => {
    const { sub: userId } = request.user as { sub: string };
    const { id } = request.params as { id: string };
    await deleteTransfer(userId, id);
    return sendSuccess(reply, null);
  });
}
