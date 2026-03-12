import { db } from "../infra/database/database.ts";
import { env } from "../infra/environment.ts";
import { app } from "./app.ts";

app.listen({ host: env.HOST, port: env.PORT }, async (error, address) => {
  if (error) {
    console.error("error:", error);
    process.exit(1);
  }
  console.log(`server running at ${address}`);

  try {
    const migrateStatus = await db.migrate.status();
    if (migrateStatus < 0) {
      db.migrate.latest();
    }
  } catch (error) {
    db.migrate.latest();
  }
});
