import { randomUUID } from "node:crypto";
import type { FastifyInstance } from "fastify";
import * as z from "zod";

import { db } from "../../infra/database/database.ts";

export const recipeRoutes = (fastify: FastifyInstance, _options: Object) => {
  interface Recipe {
    id: string;
    name: string;
    description: string;
    happened_at: string;
    is_in_diet: boolean;
  }

  fastify.post("/recipe", async (request, reply) => {
    const recipeBodySchema = z.object({
      user_id: z.uuid(),
      name: z.string(),
      description: z.string(),
      is_in_diet: z.boolean(),
    });

    try {
      const parsedBody = recipeBodySchema.parse(request.body);

      await db<Recipe>("recipe").insert({
        id: randomUUID(),
        happened_at: new Date().toISOString(),
        ...parsedBody,
      });

      reply.code(201).send();
    } catch (error: any) {
      const containsAny = [
        "FOREIGN KEY constraint failed",
        "Invalid UUID",
      ].some((sub) => error.message.includes(sub));

      if (containsAny) {
        return reply.code(400).send({
          error: "Bad Request",
          message: `The provided user_id (${request.body.user_id}) does not exist in the database.`,
        });
      }

      console.error(error);
      reply.code(500).send({ message: "Unexpected error happened." });
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
