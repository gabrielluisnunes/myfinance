import { Prisma } from "@myfinance/db";
import type { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import { ZodError } from "zod";

const HTTP_STATUS_CODES: Record<number, string> = {
  400: "BAD_REQUEST",
  401: "UNAUTHORIZED",
  403: "FORBIDDEN",
  404: "NOT_FOUND",
  409: "CONFLICT",
  422: "UNPROCESSABLE_ENTITY",
};

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

  // Prisma unique constraint violation → 409
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  ) {
    return reply.status(409).send({
      error: { code: "CONFLICT", message: "Resource already exists" },
    });
  }

  // Any manually thrown { statusCode, message } error
  if (error.statusCode && error.statusCode >= 400 && error.statusCode < 500) {
    const code = HTTP_STATUS_CODES[error.statusCode] ?? "CLIENT_ERROR";
    return reply.status(error.statusCode).send({
      error: { code, message: error.message },
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
