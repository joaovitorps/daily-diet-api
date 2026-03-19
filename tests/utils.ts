import request from "supertest";

import type { UserRequestBody } from "../src/routes/user.ts";
import type { MealRequestBody } from "../src/routes/meal.ts";
import { app } from "../src/app.ts";

export const getSessionId = (cookies: string[]) => {
  return (
    cookies[0]
      ?.split(";")
      .filter((positions) => {
        return positions.includes("id=");
      })[0]
      ?.split("=") || []
  );
};

export const createUserResponse = async (userBody?: UserRequestBody) => {
  if (!userBody) {
    userBody = {
      name: "John",
    };
  }
  const createUserResponse = await request(app.server)
    .post("/user")
    .send(userBody);

  const cookies = createUserResponse.get("Set-Cookie") as string[];
  const [_cookieName, cookieValue] = getSessionId(cookies);

  return { cookies, userId: cookieValue, createUserResponse };
};

export const createMealResponse = async (
  cookies: string[],
  mealBody?: MealRequestBody,
) => {
  if (!mealBody) {
    mealBody = {
      name: "Rice and beans",
      description: "A place of rice and beans",
      is_in_diet: true,
    };
  }

  const createMealResponse = await request(app.server)
    .post("/meal")
    .send(mealBody)
    .set("Cookie", cookies);

  return { createMealResponse };
};
