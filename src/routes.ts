import { randomUUID } from "node:crypto";
import type { FastifyInstance } from "fastify";
import * as z from "zod";

import { db } from "../infra/database/database.ts";
import { middleware } from "./server.ts";

export const routes = (fastify: FastifyInstance, _options: Object) => {
  interface User {
    id: string;
    name: string;
  }

  fastify.post("/user", async (request, reply) => {
    const UserRequesSchema = z.object({
      name: z.string(),
    });
    const data = UserRequesSchema.parse(request.body);

    const [insertedUser]: { id: string }[] = await db<User>("user")
      .returning(["id"])
      .insert({
        id: randomUUID(),
        name: data.name,
      });

    if (insertedUser) {
      reply.setCookie("id", insertedUser.id).code(201).send();
    } else {
      reply.code(500).send("Unexpected error happened");
    }
  });

  fastify.get(
    "/user",
    { preHandler: [middleware] },
    async (_request, reply) => {
      const users = await db<User>("user").select();

      reply.send(users).code(200);
    },
  );
};
