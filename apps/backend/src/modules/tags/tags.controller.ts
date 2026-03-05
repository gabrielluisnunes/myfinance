import type { FastifyInstance } from "fastify";
import { authenticate } from "../../middlewares/authenticate.js";
import { sendCreated, sendSuccess } from "../../utils/response.js";
import { createTagSchema, updateTagSchema } from "./tags.schema.js";
import { createTag, deleteTag, listTags, updateTag } from "./tags.service.js";

export async function tagRoutes(app: FastifyInstance) {
  app.addHook("preHandler", authenticate);

  app.get("/", async (request, reply) => {
    const { sub: userId } = request.user as { sub: string };
    const tags = await listTags(userId);
    return sendSuccess(reply, tags);
  });

  app.post("/", async (request, reply) => {
    const { sub: userId } = request.user as { sub: string };
    const input = createTagSchema.parse(request.body);
    const tag = await createTag(userId, input);
    return sendCreated(reply, tag);
  });

  app.patch("/:id", async (request, reply) => {
    const { sub: userId } = request.user as { sub: string };
    const { id } = request.params as { id: string };
    const input = updateTagSchema.parse(request.body);
    const tag = await updateTag(userId, id, input);
    return sendSuccess(reply, tag);
  });

  app.delete("/:id", async (request, reply) => {
    const { sub: userId } = request.user as { sub: string };
    const { id } = request.params as { id: string };
    await deleteTag(userId, id);
    return sendSuccess(reply, null);
  });
}
