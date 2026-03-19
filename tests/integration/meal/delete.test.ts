import { describe, expect, it } from "vitest";
import request from "supertest";

import { app } from "../../../src/app.ts";
import { getSessionId } from "../../utils.ts";

describe("DELETE /meal", () => {
  it("should delete a recipe", async () => {
    const userBody = {
      name: "John",
    };

    const createUserResponse = await request(app.server)
      .post("/user")
      .send(userBody);

    const cookies = createUserResponse.get("Set-Cookie") as string[];
    const [_cookieName, cookieValue] = getSessionId(cookies);

    const mealBody = {
      user_id: cookieValue,
      name: "meal",
      description: "a meal",
      is_in_diet: 0,
    };

    await request(app.server)
      .post("/meal")
      .send(mealBody)
      .set("Cookie", cookies);

    const allMealsRequest = await request(app.server)
      .get("/meal")
      .set("Cookie", cookies);

    const mealId = allMealsRequest.body[0].id;

    await request(app.server)
      .delete(`/meal/${mealId}`)
      .set("Cookie", cookies)
      .expect(200);

    const allMealsRequestShouldBeEmpty = await request(app.server)
      .get("/meal")
      .set("Cookie", cookies);

    expect(allMealsRequestShouldBeEmpty.body).toEqual([]);
  });

  it("should return 400 on invalid id", async () => {
    const userBody = {
      name: "John",
    };

    const createUserResponse = await request(app.server)
      .post("/user")
      .send(userBody);

    const cookies = createUserResponse.get("Set-Cookie") as string[];

    const mealId = "unknownId";

    await request(app.server)
      .delete(`/meal/${mealId}`)
      .set("Cookie", cookies)
      .expect(400)
      .then((response) => {
        expect(response.body).toEqual({
          message: `Meal with id ${mealId} not found.`,
        });
      });
  });
});
