import middy from "@middy/core";
import httpErrorHandler from "@middy/http-error-handler";
import httpHeaderNormalizer from "@middy/http-header-normalizer";
import jsonBodyParser from "@middy/http-json-body-parser";
import validator from "@middy/validator";
import { transpileSchema } from "@middy/validator/transpile";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import createError from "http-errors";
import jwtAuthMiddleware, {
  EncryptionAlgorithms,
} from "middy-middleware-jwt-auth";

import { isTokenPayload, secret } from "@/authUtils/jwtUtil";
import {
  API_KEY_AUTHENTICATION_FAILED_ERROR_MESSAGE,
  PRISMA_ERROR_CODE,
} from "@/constants/errorMessages";
import { addWorkshopSchema } from "@/models/schemas";
import { createWorkShop, type Workshop } from "@/services/db/createWorkshop";

export async function lambdaHandler(request) {
  const payload: Workshop = request.body;
  const userUuid = request.auth.payload.sub;

  const addWorkshopEntity = {
    ...payload,
    user_id: userUuid,
  };
  const result = await createWorkShop(addWorkshopEntity).catch((err) => {
    console.warn(err);
    return err;
  });

  if (result instanceof Error) {
    if (
      result instanceof PrismaClientKnownRequestError &&
      result.code === PRISMA_ERROR_CODE.P2003
    ) {
      throw createError(400, API_KEY_AUTHENTICATION_FAILED_ERROR_MESSAGE);
    }
    throw result;
  }

  return {
    statusCode: 200,
    body: JSON.stringify(result),
    headers: { "Content-Type": "application/json" },
  };
}

export const handler = middy()
  .use(jsonBodyParser())
  .use(httpHeaderNormalizer())
  .use(validator({ eventSchema: transpileSchema(addWorkshopSchema) }))
  .use(
    jwtAuthMiddleware({
      algorithm: EncryptionAlgorithms.HS256,
      credentialsRequired: true,
      isPayload: isTokenPayload,
      secretOrPublicKey: secret,
    }),
  )
  .use(httpErrorHandler())
  .handler(lambdaHandler);
