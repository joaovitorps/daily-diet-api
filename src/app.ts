import { fastify, type FastifyReply, type FastifyRequest } from "fastify";
import cookie, { type FastifyCookieOptions } from "@fastify/cookie";

import { routes } from "./routes.ts";

export const app = fastify({ logger: { level: "info" } });

app.register(cookie, {} as FastifyCookieOptions);

app.register(routes);

export const middleware = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const cookies = request.headers.cookie;

  if (!cookies) {
    return reply.code(401).send({ error: "Not authorized" });
  }
};
