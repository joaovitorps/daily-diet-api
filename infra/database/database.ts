import knex from "knex";
import type { Knex } from "knex";

export const config: Knex.Config = {
  client: "sqlite3",
  connection: {
    filename: "./dev.sqlite3",
  },
  useNullAsDefault: true,
  migrations: {
    extension: "ts",
    directory: "./infra/database/migrations",
  },

  //   production: {
  //     client: "postgresql",
  //     connection: {
  //       database: "my_db",
  //       user: "username",
  //       password: "password",
  //     },
  //     pool: {
  //       min: 2,
  //       max: 10,
  //     },
  //     migrations: {
  //       tableName: "knex_migrations",
  //     },
  //   },
};

export const db = knex(config);
