import { randomUUID } from "node:crypto";
import type { FastifyInstance } from "fastify";
import * as z from "zod";

import { db } from "../infra/database/database.ts";
import { middleware } from "./app.ts";

export const routes = (fastify: FastifyInstance, _options: Object) => {
  interface User {
    id: string;
    name: string;
  }

  interface Recipe {
    id: string;
    name: string;
    description: string;
    happened_at: string;
    is_in_diet: boolean;
  }

  fastify.post("/user", async (request, reply) => {
    const UserRequesSchema = z
      .object({
        name: z.string().nonempty().min(3),
      })
      .transform(({ name }) => ({ name: name.trim() }));

    try {
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
      await db<Recipe>("recipe").insert({
        id: randomUUID(),
        happened_at: new Date().toISOString(),
        ...parsedBody,
      });

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

  fastify.put<{ Params: { id: string } }>(
    "/recipe/:id",
    async (request, reply) => {
      const recipeBodySchema = z.object({
        name: z.string().optional(),
        description: z.string().optional(),
        happened_at: z.string().optional(),
        is_in_diet: z.boolean().optional(),
      });

      try {
        const parsedBody = recipeBodySchema.parse(request.body);

        const { id } = request.params;

        // remove undefined keys because of 'exactOptionalPropertyTypes'
        const dataToUpdate = Object.fromEntries(
          Object.entries(parsedBody).filter(
            ([_options, values]) => values != undefined,
          ),
        );

        console.log(dataToUpdate);

        if (Object.keys(parsedBody).length === 0) {
          reply
            .code(400)
            .send({ error: "Please, specify at least one field to edit." });
        }

        await db<Recipe>("recipe").update(dataToUpdate).where("id", id);

        reply.code(200).send();
      } catch (error) {}
    },
  );
};
