import fastify from "fastify";

const server = fastify();

server.post("/user", async (request, reply) => {
  return "pong";
});

server.listen({ port: 8000 }, (error, address) => {
  if (error) {
    console.error("error:", error);
    process.exit(1);
  }
  console.log(`server running at ${address}`);
});
