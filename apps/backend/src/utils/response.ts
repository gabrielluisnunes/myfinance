import type { FastifyReply } from "fastify";

export function sendSuccess<T>(reply: FastifyReply, data: T, statusCode = 200) {
  return reply.status(statusCode).send({ data });
}

export function sendCreated<T>(reply: FastifyReply, data: T) {
  return sendSuccess(reply, data, 201);
}

export function sendNotFound(reply: FastifyReply, message: string) {
  return reply.status(404).send({
    error: { code: "NOT_FOUND", message },
  });
}

export function sendConflict(reply: FastifyReply, message: string) {
  return reply.status(409).send({
    error: { code: "CONFLICT", message },
  });
}
