import * as z from "zod";
import type { FastifyInstance } from "fastify";

import { middleware } from "../app.ts";
import { getAll, insert } from "../models/User.ts";

export const userRoutes = (fastify: FastifyInstance) => {
  fastify.post("/user", async (request, reply) => {
    const UserRequesSchema = z
      .object({
        name: z.string().nonempty().min(3),
      })
      .transform(({ name }) => ({ name: name.trim() }));

    try {
      const data = UserRequesSchema.parse(request.body);

      const insertedUser: { id: string } | undefined = await insert(data.name);

      if (insertedUser) {
        reply
          .setCookie("id", insertedUser.id, {
            path: "/",
            maxAge: 60 * 60 * 24 * 7, // 7 days
          })
          .code(201)
          .send();
      } else {
        reply.code(503).send({ message: "Service is not available." });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        reply.code(400).send({
          message: "One or more required fields are empty.",
          reason: z.treeifyError(error),
        });
      } else {
        console.error(error);
        reply.code(500).send({ message: "Unexpected error happened." });
      }
    }
  });

  fastify.get(
    "/user",
    { preHandler: [middleware] },
    async (_request, reply) => {
      const users = await getAll();

      reply.send(users).code(200);
    },
  );
};
