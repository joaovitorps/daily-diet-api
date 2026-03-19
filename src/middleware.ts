import type { FastifyReply, FastifyRequest } from "fastify";

import { getById } from "./models/User.ts";

declare module "fastify" {
  interface FastifyRequest {
    userId?: string;
  }
}

const extractSessionId = (request: FastifyRequest): string | undefined => {
  return request.cookies.id;
};

const validateSession = async (
  sessionId: string | undefined,
): Promise<boolean> => {
  if (!sessionId) return false;

  const user = await getById(sessionId);
  return user.length > 0;
};

export const authenticate = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const sessionId = extractSessionId(request);

  const isValid = await validateSession(sessionId);

  if (!isValid || !sessionId) {
    return reply.code(401).send({ error: "Not authorized" });
  }

  request.userId = sessionId;
};
