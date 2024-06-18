import createError from "http-errors";

import { signJwt } from "@/authUtils/jwtUtil";
import { USER_AUTHENTICATION_FAILED_ERROR_MESSAGE } from "@/constants/errorMessages";
import { middyUnauthorized } from "@/middleware/middy/middyUnauthorized";
import { authUserSchema } from "@/models/schemas";
import { type Auth, signInUser } from "@/services/db/user/signInUser";

export async function lambdaHandler(request) {
  const requestPayload: Auth = request.body;
  const user = await signInUser(requestPayload);

  if (user === null) {
    throw createError(400, USER_AUTHENTICATION_FAILED_ERROR_MESSAGE);
  }

  const payload = {
    sub: user.id,
  };
  const protectedHeader = {
    alg: "HS256",
    typ: "JWT",
  };
  const jwt = await signJwt(payload, protectedHeader);
  return {
    statusCode: 200,
    body: JSON.stringify({ JWT: jwt }),
    headers: { "Content-Type": "application/json" },
  };
}

export const handler = middyUnauthorized(lambdaHandler, authUserSchema);
