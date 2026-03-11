import fastifyJwt from "@fastify/jwt";
import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";

export const jwtPlugin = fp(async (app: FastifyInstance) => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET environment variable is required");
  }

  if (secret.length < 32) {
    throw new Error(
      "JWT_SECRET must be at least 32 characters. Generate one with: node -e \"console.log(require('crypto').randomBytes(64).toString('hex'))\"",
    );
  }

  app.register(fastifyJwt, {
    secret,
    sign: {
      expiresIn: "2d",
    },
  });
});
