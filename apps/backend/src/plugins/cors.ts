import fastifyCors from "@fastify/cors";
import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";

export const corsPlugin = fp(async (app: FastifyInstance) => {
  const origin = process.env.CORS_ORIGIN;

  if (!origin && process.env.NODE_ENV === "production") {
    throw new Error(
      "CORS_ORIGIN environment variable is required in production",
    );
  }

  app.register(fastifyCors, {
    // Never fall back to wildcard '*': restrict to explicit origins only
    origin: origin
      ? origin.split(",").map((o) => o.trim())
      : ["http://localhost:8081", "http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  });
});
