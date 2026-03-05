import type { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import { ZodError } from "zod";

export function errorHandler(
  error: FastifyError,
  _request: FastifyRequest,
  reply: FastifyReply,
) {
  if (error instanceof ZodError) {
    return reply.status(400).send({
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid input data",
        details: error.flatten().fieldErrors,
      },
    });
  }

  if (error.statusCode === 401) {
    return reply.status(401).send({
      error: {
        code: "UNAUTHORIZED",
        message: "Authentication required",
      },
    });
  }

  if (error.statusCode === 404) {
    return reply.status(404).send({
      error: {
        code: "NOT_FOUND",
        message: error.message,
      },
    });
  }

  // Never expose internal error details to the client
  reply.log.error(error);
  return reply.status(500).send({
    error: {
      code: "INTERNAL_ERROR",
      message: "An unexpected error occurred",
    },
  });
}
