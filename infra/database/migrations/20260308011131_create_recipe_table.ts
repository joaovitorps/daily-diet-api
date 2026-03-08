import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("recipe", (table) => {
    table.uuid("id").primary();
    table.uuid("user_id").references("id").inTable("user");
    table.string("name", 255).notNullable();
    table.text("description").notNullable();
    table.boolean("is_in_diet").notNullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable("recipe");
}
