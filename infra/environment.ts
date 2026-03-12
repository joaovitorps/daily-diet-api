import "dotenv/config";
import * as z from "zod";

const EnvEnum = z.enum(["development", "test", "production"]);

export const Env = z.object({
  NODE_ENV: EnvEnum.default("production"),
  PORT: z.coerce.number().default(8000),
  HOST: z.string().default("localhost"),
});

const parsedEnv = Env.safeParse(process.env);

if (!parsedEnv.success) {
  const errorMsg = "⚠️ ENV variables invalid!";
  console.error(parsedEnv.error.message, z.treeifyError(parsedEnv.error));
  throw new Error(errorMsg);
}

export type EnvEnum = z.infer<typeof EnvEnum>;
export const env = parsedEnv.data;
