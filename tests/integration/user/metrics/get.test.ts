import { describe, expect, it } from "vitest";
import {
  createMealResponse,
  createUserResponse,
  getUserMetricsResponse,
} from "../../../utils.ts";
import type { MealRequestBody } from "../../../../src/routes/meal.ts";

describe("GET /user/metrics", () => {
  it("should return all user metrics", async () => {
    const { cookies } = await createUserResponse();

    const mealBody: MealRequestBody = {
      name: "test meal",
      description: "test description",
      is_in_diet: true,
    };

    const mealBody2: MealRequestBody = {
      name: "test meal 2",
      description: "test description 2",
      is_in_diet: false,
    };

    await createMealResponse(cookies);
    await createMealResponse(cookies, mealBody);
    await createMealResponse(cookies, mealBody2);

    const response = await getUserMetricsResponse(cookies);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      mealsRecorded: 3,
      mealsInDiet: 2,
      mealsOutOfDiet: 1,
      bestSequenceInDiet: 2,
    });
  });
});
