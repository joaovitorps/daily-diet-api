import fastify from "fastify";
import { db } from "../infra/database/database.ts";
import * as z from "zod";
import { randomUUID } from "node:crypto";

const server = fastify();
interface User {
  id: string;
  name: string;
}

const User = z.object({
  name: z.string(),
});

server.post("/user", async (request, reply) => {
  const data = User.parse(request.body);

  const insertedUser = await db<User>("user").insert(
    {
      id: randomUUID(),
      name: data.name,
    },
    ["name"],
  );

  console.log(insertedUser);

  reply.code(201).send();
});

server.get("/user", async (request, reply) => {
  const users = await db<User>("user").select();

  console.log({ users });

  reply.send(users).code(200);
});

server.listen({ port: 8000 }, (error, address) => {
  if (error) {
    console.error("error:", error);
    process.exit(1);
  }
  console.log(`server running at ${address}`);
});
