import { describe, expect, it } from "vitest";
import request from "supertest";

import { app } from "../../../src/app.ts";

describe("POST /recipe", () => {
  it.only("should create a recipe", async () => {
    const userBody = {
      name: "John",
    };

    const createUserResponse = await request(app.server)
      .post("/user")
      .send(userBody);

    const cookies = createUserResponse.get("Set-Cookie") as string[];
    const [_cookieName, cookieValue] =
      cookies[0]
        ?.split(";")
        .filter((positions) => {
          return positions.includes("id=");
        })[0]
        ?.split("=") || [];

    const recipeBody = {
      user_id: cookieValue,
      name: "recipe",
      description: "a recipe",
      is_in_diet: false,
    };

    await request(app.server)
      .post("/recipe")
      .send(recipeBody)
      .set("Cookie", cookies)
      .expect(201);
  });

  it.only("should fail on unknown id", async () => {
    const userBody = {
      name: "John",
    };

    const createUserResponse = await request(app.server)
      .post("/user")
      .send(userBody);

    const cookies = createUserResponse.get("Set-Cookie") as string[];

    const recipeBody = {
      user_id: "unknown_id",
      name: "recipe",
      description: "a recipe",
      is_in_diet: false,
    };

    const response = await request(app.server)
      .post("/recipe")
      .send(recipeBody)
      .set("Cookie", cookies)
      .expect(400);

    expect(response.body).toMatchObject({
      message: `The provided user_id (${recipeBody.user_id}) does not exist in the database.`,
    });
  });
});
