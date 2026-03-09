import fastifyCors from "@fastify/cors";
import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";

export const corsPlugin = fp(async (app: FastifyInstance) => {
  app.register(fastifyCors, {
    origin: process.env.CORS_ORIGIN ?? "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  });
});
