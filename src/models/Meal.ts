import { db } from "../../infra/database/database.ts";

export interface Meal {
  id: string;
  name: string;
  user_id: string;
  description: string;
  happened_at: string;
  is_in_diet: boolean;
}

export const getAllByUserId = async (userId: string) => {
  return db<Meal>("meal").select().where({ user_id: userId });
};

export const insert = async (data: Meal) => {
  await db<Meal>("meal").insert(data);
};

export const getByIdAndUserId = async (id: string, userId: string) => {
  return db<Meal>("meal").select().where({ id, user_id: userId }).first();
};

export const update = async (
  // Partial makes data from Interface optional, and Omit, omit fields from Interface
  data: Partial<Omit<Meal, "id" | "user_id">>,
  id: string,
) => {
  await db<Meal>("meal").update(data).where("id", id);
};

export const remove = async (id: string) => {
  return db<Meal>("meal").where({ id }).del();
};
