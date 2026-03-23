import * as z from "zod";
import type { FastifyInstance } from "fastify";

import { getAll, insert } from "../models/User.ts";
import { authenticate } from "../middleware.ts";
import { getAllByUserId } from "../models/Meal.ts";

const UserRequesSchema = z
  .object({
    name: z.string().nonempty().min(3),
  })
  .transform(({ name }) => ({ name: name.trim() }));

export type UserRequestBody = z.infer<typeof UserRequesSchema>;

export const userRoutes = (fastify: FastifyInstance) => {
  fastify.post("/user", async (request, reply) => {
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
    { preHandler: [authenticate] },
    async (_request, reply) => {
      const users = await getAll();

      reply.send(users).code(200);
    },
  );

  fastify.get(
    "/user/metrics",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const mealData = await getAllByUserId(request.userId);

      const mealsRecorded = mealData.length;
      const mealsInDiet = mealData.filter((meal) => meal.is_in_diet).length;
      const mealsOutOfDiet = mealData.filter((meal) => !meal.is_in_diet).length;
      const { bestSequenceInDiet } = mealData.reduce(
        (accumulator, current) => {
          let { bestSequenceInDiet, currentSequence } = accumulator;

          if (current.is_in_diet) {
            currentSequence++;
          } else {
            currentSequence = 0;
          }

          if (currentSequence > bestSequenceInDiet) {
            bestSequenceInDiet = currentSequence;
          }

          return { bestSequenceInDiet, currentSequence };
        },
        { bestSequenceInDiet: 0, currentSequence: 0 },
      );

      const metrics = {
        mealsRecorded,
        mealsInDiet,
        mealsOutOfDiet,
        bestSequenceInDiet,
      };

      return reply.code(200).send(metrics);
    },
  );
};
