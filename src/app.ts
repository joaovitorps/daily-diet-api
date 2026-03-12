import { fastify, type FastifyReply, type FastifyRequest } from "fastify";
import { fastifyCookie, type FastifyCookieOptions } from "@fastify/cookie";

import { userRoutes } from "./routes/user.ts";
import { recipeRoutes } from "./routes/recipe.ts";

export const app = fastify({ logger: { level: "info" } });

app.register(fastifyCookie, {} as FastifyCookieOptions);
app.register(userRoutes);
app.register(recipeRoutes);

export const middleware = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const cookies = request.cookies.id;

  if (!cookies) {
    return reply.code(401).send({ error: "Not authorized" });
  }
};
