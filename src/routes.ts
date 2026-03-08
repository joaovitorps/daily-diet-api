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

  interface Recipe {
    id: string;
    name: string;
    description: string;
    is_in_diet: boolean;
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

  fastify.post("/recipe", async (request, reply) => {
    const recipeBodySchema = z.object({
      user_id: z.uuid(),
      name: z.string(),
      description: z.string(),
      is_in_diet: z.boolean(),
    });

    const parsedBody = recipeBodySchema.parse(request.body);

    try {
      await db<Recipe>("recipe").insert({ id: randomUUID(), ...parsedBody });

      reply.code(201).send();
    } catch (error: any) {
      if (error.message.includes("FOREIGN KEY constraint failed")) {
        return reply.code(400).send({
          error: "Bad Request",
          message: `The provided user_id (${parsedBody.user_id}) does not exist in the database.`,
        });
      }

      console.error(error);
      throw error;
    }
  });

  fastify.get("/recipe", async (_request, reply) => {
    const recipes = await db<Recipe>("recipe").select();

    reply.code(200).send(recipes);
  });
};
