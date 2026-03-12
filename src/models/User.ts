import { randomUUID } from "node:crypto";

import { db } from "../../infra/database/database.ts";

interface User {
  id: string;
  name: string;
}

export const getAll = async () => {
  return await db<User>("user").select();
};

export const getById = async (id: string) => {
  return await db<User>("user").where("id", id).select();
};

export const insert = async (name: string) => {
  const [insertedUser]: { id: string }[] = await db<User>("user")
    .returning(["id"])
    .insert({
      id: randomUUID(),
      name,
    });

  return insertedUser;
};
