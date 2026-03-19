import { fastify, type FastifyReply, type FastifyRequest } from "fastify";
import { fastifyCookie, type FastifyCookieOptions } from "@fastify/cookie";

import { userRoutes } from "./routes/user.ts";
import { mealRoutes } from "./routes/meal.ts";

export const app = fastify({ logger: { level: "info" } });

app.register(fastifyCookie, {} as FastifyCookieOptions);
app.register(userRoutes);
app.register(mealRoutes);
