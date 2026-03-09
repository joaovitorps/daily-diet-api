import request from "supertest";
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from "vitest";

import { app } from "../../src/app.ts";
import { db } from "../../infra/database/database.ts";

beforeAll(async () => {
  await db.migrate.latest().then(() => console.log("Migrations completed"));
  await app.ready();
});

afterAll(async () => {
  await db.migrate
    .rollback(undefined, true)
    .then(() => console.log("Migrations rolled back"));
  app.close();
});

beforeEach(async () => {});

afterEach(() => {});

describe("POST /user", () => {
  it("should create a user and return 201", async () => {
    const response = await request(app.server)
      .post("/user")
      .set("Accept", "application/json")
      .send({ name: "Test user" });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({});
  });

  it("should return a error when body is empty and return 400", async () => {
    const response = await request(app.server)
      .post("/user")
      .set("Accept", "application/json");

    expect(response.status).toBe(400);
    const responseReason = response.body.reason;
    expect(Object.keys(responseReason).length).toBeGreaterThan(0);
    expect(Object.keys(responseReason.errors).length).toBeGreaterThan(0);
  });

  it("should return a error on invalid body send and return 400", async () => {
    const response = await request(app.server)
      .post("/user")
      .set("Accept", "application/json")
      .send({ invalidField: "foo" });

    expect(response.status).toBe(400);
    const responseReason = response.body.reason;
    expect(Object.keys(responseReason).length).toBeGreaterThan(0);
    expect(Object.keys(responseReason.errors)).toBeDefined();
    expect(Object.keys(responseReason.properties).length).toBeGreaterThan(0);
  });

  it("should return a error when name is empty and return 400", async () => {
    const response = await request(app.server)
      .post("/user")
      .set("Accept", "application/json")
      .send({ name: "" });

    expect(response.status).toBe(400);
    const responseReason = response.body.reason;
    expect(Object.keys(responseReason).length).toBeGreaterThan(0);
    expect(Object.keys(responseReason.errors)).toBeDefined();
    expect(Object.keys(responseReason.properties).length).toBeGreaterThan(0);
  });
});
