import { afterAll, beforeAll, beforeEach } from "vitest";

import { app } from "../src/app.ts";
import { db } from "../infra/database/database.ts";

beforeAll(async () => {
  await app.ready();
});

afterAll(async () => {
  await app.close();
});

beforeEach(async () => {
  await db.migrate.latest().then(() => console.log("Migrations completed"));
});
