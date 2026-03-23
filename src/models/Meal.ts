import { db } from "../../infra/database/database.ts";

interface Meal {
  id: string;
  name: string;
  user_id: string;
  description: string;
  happened_at: string;
  is_in_diet: boolean;
}

export const getAllByUserId = (userId: string) => {
  return db<Meal>("meal").select().where({ user_id: userId });
};
