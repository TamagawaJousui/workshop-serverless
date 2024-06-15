import middy from "@middy/core";
import httpErrorHandler from "@middy/http-error-handler";
import jsonBodyParser from "@middy/http-json-body-parser";
import validator from "@middy/validator";
import { transpileSchema } from "@middy/validator/transpile";
import { PrismaClient } from "@prisma/client";
import { compareSync } from "bcryptjs";
import createError from "http-errors";

import { signJwt } from "../authUtils/jwtUtil";
import { USER_AUTHENTICATION_FAILED_ERROR_MESSAGE } from "../constants/errorMessages";
import { authUserSchema } from "../constants/schemas";

const prisma = new PrismaClient();

type AuthUserReqEntity = {
  email: string;
  password: string;
};

async function signIn(userReq: AuthUserReqEntity) {
  const userInDb = await prisma.users.findUnique({
    where: {
      email: userReq.email,
    },
  });
  if (userInDb === null) {
    return userInDb;
  }
  const hashedPassword = userInDb.hashed_password;
  if (!compareSync(userReq.password, hashedPassword)) {
    return null;
  }
  return userInDb;
}

export async function lambdaHandler(request) {
  const requestPayload: AuthUserReqEntity = request.body;
  const userInDb = await signIn(requestPayload).catch((err) => {
    console.warn(err);
    return err;
  });

  if (userInDb instanceof Error) {
    throw createError(500);
  }

  if (userInDb === null) {
    throw createError(400, USER_AUTHENTICATION_FAILED_ERROR_MESSAGE);
  }

  const payload = {
    sub: userInDb.id,
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

export const handler = middy()
  .use(jsonBodyParser())
  .use(validator({ eventSchema: transpileSchema(authUserSchema) }))
  .use(httpErrorHandler())
  .handler(lambdaHandler);
