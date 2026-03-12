import knex, { type Knex } from "knex";

import { env, type EnvEnum } from "../environment.ts";

const defaultDevConfig = (filename: string): Knex.Config => {
  return {
    client: "sqlite3",
    connection: {
      filename,
    },
    useNullAsDefault: true,
    pool: {
      afterCreate: (conn: any, cb: any) => {
        conn.run("PRAGMA FOREIGN_KEYS = ON", cb);
      },
    },
    migrations: {
      extension: "ts",
      directory: "./infra/database/migrations",
    },
  };
};

export const config: Record<EnvEnum, Knex.Config> = {
  development: {
    ...defaultDevConfig("./infra/database/dev.sqlite3"),
  },
  test: {
    ...defaultDevConfig(":memory:"),
  },
  production: {},
};

export const db = knex(config[env.NODE_ENV]);
