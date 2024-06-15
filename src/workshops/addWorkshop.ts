import middy from "@middy/core";
import httpErrorHandler from "@middy/http-error-handler";
import httpHeaderNormalizer from "@middy/http-header-normalizer";
import jsonBodyParser from "@middy/http-json-body-parser";
import validator from "@middy/validator";
import { transpileSchema } from "@middy/validator/transpile";
import { PrismaClient } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import createError from "http-errors";
import jwtAuthMiddleware, {
  EncryptionAlgorithms,
} from "middy-middleware-jwt-auth";

import { isTokenPayload, secret } from "../authUtils/jwtUtil";
import { API_KEY_AUTHENTICATION_FAILED_ERROR_MESSAGE } from "../constants/errorMessages";
import { addWorkshopSchema } from "../constants/schemas";

const prisma = new PrismaClient();

type AddWorkshopReqEntity = {
  start_at: string;
  end_at: string;
  participation_method: string;
  content?: string;
  preparation?: string;
  materials?: string;
};

type AddWorkshopEntity = {
  start_at: string;
  end_at: string;
  participation_method: string;
  content?: string;
  preparation?: string;
  materials?: string;
  user_id: string;
};

async function addWorkShop(workshop: AddWorkshopEntity) {
  const result = await prisma.workshops.create({
    data: workshop,
  });
  return result;
}

export async function lambdaHandler(request) {
  const payload: AddWorkshopReqEntity = request.body;
  const userUuid = request.auth.payload.sub;

  const addWorkshopEntity = {
    ...payload,
    user_id: userUuid,
  };
  const result = await addWorkShop(addWorkshopEntity).catch((err) => {
    console.warn(err);
    return err;
  });

  if (result instanceof Error) {
    if (result instanceof PrismaClientKnownRequestError) {
      throw createError(400, API_KEY_AUTHENTICATION_FAILED_ERROR_MESSAGE);
    }
    throw createError(500);
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
