import { describe, expect, it } from "vitest";
import request from "supertest";

import { app } from "../../../src/app.ts";
import { randomUUID } from "node:crypto";

describe("POST /meal", () => {
  it("should create a meal", async () => {
    const userBody = {
      name: "John",
    };

    const createUserResponse = await request(app.server)
      .post("/user")
      .send(userBody);

    const cookies = createUserResponse.get("Set-Cookie") as string[];

    const mealBody = {
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

  it("should fail on unknown id", async () => {
    const userBody = {
      name: "John",
    };

    await request(app.server).post("/user").send(userBody);

    const mealBody = {
      name: "meal",
      description: "a meal",
      is_in_diet: false,
    };

    const id = randomUUID();

    const response = await request(app.server)
      .post("/meal")
      .send(mealBody)
      .set("Cookie", [`id=${id}`])
      .expect(401);

    expect(response.body).toEqual({
      error: `Not authorized.`,
    });
  });
});
