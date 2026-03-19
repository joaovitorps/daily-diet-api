import { randomUUID } from "node:crypto";
import type { FastifyInstance } from "fastify";
import * as z from "zod";

import { db } from "../../infra/database/database.ts";
import { authenticate } from "../middleware.ts";

export const mealRoutes = (fastify: FastifyInstance, _options: Object) => {
  interface meal {
    id: string;
    name: string;
    description: string;
    happened_at: string;
    is_in_diet: boolean;
  }

  fastify.post(
    "/meal",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const mealBodySchema = z.object({
        user_id: z.uuid(),
        name: z.string(),
        description: z.string(),
        is_in_diet: z.coerce.boolean(),
      });

      try {
        const parsedBody = mealBodySchema.parse(request.body);

        await db<meal>("meal").insert({
          id: randomUUID(),
          happened_at: new Date().toISOString(),
          ...parsedBody,
        });

        reply.code(201).send();
      } catch (error: any) {
        const body = request.body as { user_id?: string } | null;
        const containsAny = [
          "FOREIGN KEY constraint failed",
          "Invalid UUID",
        ].some((sub) => error.message.includes(sub));

        if (containsAny) {
          return reply.code(400).send({
            error: "Bad Request",
            message: `The provided user_id (${body?.user_id}) does not exist in the database.`,
          });
        }

        console.error(error);
        reply.code(500).send({ message: "Unexpected error happened." });
        throw error;
      }
    },
  );

  fastify.get(
    "/meal",
    { preHandler: [authenticate] },
    async (_request, reply) => {
      const meals = await db<meal>("meal").select();

      reply.code(200).send(meals);
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
