import { describe, expect, it } from "vitest";
import request from "supertest";

import { app } from "../../../src/app.ts";
import { getSessionId } from "../../utils.ts";

describe("POST /meal", () => {
  it.only("should create a meal", async () => {
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
      .set("Cookie", cookies)
      .expect(201);

    const allMealsRequest = await request(app.server)
      .get("/meal")
      .set("Cookie", cookies);

    expect(allMealsRequest.body).toEqual([expect.objectContaining(mealBody)]);
  });

  it.only("should fail on unknown id", async () => {
    const userBody = {
      name: "John",
    };

    const createUserResponse = await request(app.server)
      .post("/user")
      .send(userBody);

    const cookies = createUserResponse.get("Set-Cookie") as string[];

    const mealBody = {
      user_id: "unknown_id",
      name: "meal",
      description: "a meal",
      is_in_diet: false,
    };

    const response = await request(app.server)
      .post("/meal")
      .send(mealBody)
      .set("Cookie", cookies)
      .expect(400);

    expect(response.body).toMatchObject({
      message: `The provided user_id (${mealBody.user_id}) does not exist in the database.`,
    });
  });
});
