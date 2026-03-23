import { randomUUID } from "node:crypto";
import type { FastifyInstance } from "fastify";
import * as z from "zod";

import { authenticate } from "../middleware.ts";
import * as Meal from "../models/Meal.ts";

const mealBodySchema = z.object({
  name: z.string(),
  description: z.string(),
  is_in_diet: z.coerce.boolean(),
});

export type MealRequestBody = z.infer<typeof mealBodySchema>;

export type MealUpdateBody = Partial<Omit<Meal.Meal, "id" | "user_id">>;

export const mealRoutes = (fastify: FastifyInstance, _options: Object) => {
  fastify.post(
    "/meal",
    { preHandler: [authenticate] },
    async (request, reply) => {
      try {
        const parsedBody = mealBodySchema.parse(request.body);
        const body = {
          id: randomUUID(),
          happened_at: new Date().toISOString(),
          user_id: request.userId,
          ...parsedBody,
        };

        await Meal.insert(body);

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

      const meals = await Meal.getAllByUserId(userId);

      reply.code(200).send(meals);
    },
  );

  fastify.get<{ Params: { id: string } }>(
    "/meal/:id",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const { id } = request.params;
      const { userId } = request;

      const meal = await Meal.getByIdAndUserId(id, userId);

      if (!meal) {
        return reply
          .code(400)
          .send({ message: `Meal with id ${id} not found.` });
      }

      meal.is_in_diet = Boolean(meal?.is_in_diet);

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
        const { userId } = request;

        const meal = await Meal.getByIdAndUserId(id, userId);

        if (!meal) {
          return reply
            .code(400)
            .send({ message: `Meal with id ${id} not found.` });
        }

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

        await Meal.update(dataToUpdate as MealUpdateBody, id);

        reply.code(200).send();
      } catch (error) {}
    },
  );

  fastify.delete<{ Params: { id: string } }>(
    "/meal/:id",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const { id } = request.params;
      const { userId } = request;

      const meal = await Meal.getByIdAndUserId(id, userId);

      if (!meal) {
        return reply
          .code(400)
          .send({ message: `Meal with id ${id} not found.` });
      }

      const deletedRows = await Meal.remove(id);

      if (deletedRows <= 0) {
        return reply
          .code(500)
          .send({ error: "Failed to delete the requested meal." });
      }

      return reply.code(200).send();
    },
  );
};
