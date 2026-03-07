import fastify, { type FastifyReply, type FastifyRequest } from "fastify";
import cookie, { type FastifyCookieOptions } from "@fastify/cookie";

import { routes } from "./routes.ts";

const server = fastify({ logger: true });

server.register(cookie, {} as FastifyCookieOptions);

server.register(routes);

export const middleware = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const cookies = request.headers.cookie;

  if (!cookies) {
    return reply.code(401).send({ error: "Not authorized" });
  }

  console.log(cookies);
};

server.listen({ port: 8000 }, (error, address) => {
  if (error) {
    console.error("error:", error);
    process.exit(1);
  }
  console.log(`server running at ${address}`);
});
