import { randomUUID } from "node:crypto";
import type { FastifyInstance } from "fastify";
import * as z from "zod";

import { db } from "../../infra/database/database.ts";
import { authenticate } from "../middleware.ts";

interface meal {
  id: string;
  name: string;
  user_id: string;
  description: string;
  happened_at: string;
  is_in_diet: boolean;
}

const mealBodySchema = z.object({
  name: z.string(),
  description: z.string(),
  is_in_diet: z.coerce.boolean(),
});

export type MealRequestBody = z.infer<typeof mealBodySchema>;

export const mealRoutes = (fastify: FastifyInstance, _options: Object) => {
  fastify.post(
    "/meal",
    { preHandler: [authenticate] },
    async (request, reply) => {
      try {
        const parsedBody = mealBodySchema.parse(request.body);

        await db<meal>("meal").insert({
          id: randomUUID(),
          happened_at: new Date().toISOString(),
          user_id: request.userId,
          ...parsedBody,
        });

        reply.code(201).send();
      } catch (error: any) {
        console.error(error);
        reply.code(500).send({ message: "Unexpected error happened." });
        throw error;
      }
    },
  );

  fastify.get(
    "/meal",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const userId = request.userId;

      const meals = await db<meal>("meal").select().where({ user_id: userId });

      reply.code(200).send(meals);
    },
  );

  fastify.get<{ Params: { id: string } }>(
    "/meal/:id",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const { id } = request.params;

      const meal = await db<meal>("meal").select().where({ id }).first();

      if (meal) {
        meal.is_in_diet = Boolean(meal?.is_in_diet);
      }

      return reply.code(200).send(meal);
    },
  );

  fastify.put<{ Params: { id: string } }>(
    "/meal/:id",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const mealBodySchema = z.object({
        name: z.string().optional(),
        description: z.string().optional(),
        happened_at: z.string().optional(),
        is_in_diet: z.boolean().optional(),
      });

      try {
        const parsedBody = mealBodySchema.parse(request.body);

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

        await db<meal>("meal").update(dataToUpdate).where("id", id);

        reply.code(200).send();
      } catch (error) {}
    },
  );

  fastify.delete<{ Params: { id: string } }>(
    "/meal/:id",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const { id } = request.params;

      const meal = await db<meal>("meal").where({ id }).first();

      if (!meal) {
        return reply
          .code(400)
          .send({ message: `Meal with id ${id} not found.` });
      }

      const deletedRows = await db<meal>("meal").where({ id }).del();

      if (deletedRows <= 0) {
        return reply
          .code(500)
          .send({ error: "Failed to delete the requested meal." });
      }

      return reply.code(200).send();
    },
  );
};
