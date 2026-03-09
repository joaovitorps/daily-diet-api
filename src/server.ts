import { app } from "./app.ts";

app.listen({ port: 8000 }, (error, address) => {
  if (error) {
    console.error("error:", error);
    process.exit(1);
  }
  console.log(`server running at ${address}`);
});
