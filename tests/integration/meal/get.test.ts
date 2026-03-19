import { describe, expect, it } from "vitest";
import request from "supertest";
import { app } from "../../../src/app.ts";
import { getSessionId } from "../../utils.ts";

describe("GET /meals", () => {
  it("should return all means", async () => {
    const userBody = {
      name: "John",
    };

    const createUserResponse = await request(app.server)
      .post("/user")
      .send(userBody);

    const cookies = createUserResponse.get("Set-Cookie") as string[];
    const [_cookieName, cookieValue] = getSessionId(cookies);

    const mealBodyFirstExample = {
      user_id: cookieValue,
      name: "meal 1",
      description: "meal 1",
      is_in_diet: 0,
    };

    const mealBodySecondExample = {
      user_id: cookieValue,
      name: "meal 2",
      description: "a meal 2",
      is_in_diet: 1,
    };

    await request(app.server)
      .post("/meal")
      .send(mealBodyFirstExample)
      .set("Cookie", cookies);

    await request(app.server)
      .post("/meal")
      .send(mealBodySecondExample)
      .set("Cookie", cookies);

    const allMealsResponse = await request(app.server)
      .get("/meal")
      .set("Cookie", cookies);

    expect(allMealsResponse.body.length).toBe(2);
    expect(allMealsResponse.body[0]).toEqual(
      expect.objectContaining(mealBodyFirstExample),
    );
    expect(allMealsResponse.body[1]).toEqual(
      expect.objectContaining(mealBodySecondExample),
    );
  });
});
