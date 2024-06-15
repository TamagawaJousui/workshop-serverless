import type { UUID } from "node:crypto";

import middy from "@middy/core";
import httpErrorHandler from "@middy/http-error-handler";
import httpHeaderNormalizer from "@middy/http-header-normalizer";
import jsonBodyParser from "@middy/http-json-body-parser";
import validator from "@middy/validator";
import { transpileSchema } from "@middy/validator/transpile";
import { PrismaClient } from "@prisma/client";
import createError from "http-errors";
import jwtAuthMiddleware, {
  EncryptionAlgorithms,
} from "middy-middleware-jwt-auth";

import { isTokenPayload, secret } from "../authUtils/jwtUtil";
import {
  USER_NOT_EXISTS_ERROR_MESSAGE,
  WORKSHOP_NOT_EXISTS_ERROR_MESSAGE,
} from "../constants/errorMessages";
import { createReviewSchema } from "../models/schemas";
const prisma = new PrismaClient();

type Review = {
  workshop_id: UUID;
  content: string;
};

function createReview(review: Review, userUuid: UUID) {
  return prisma.$transaction(async (client) => {
    const workshop = await client.workshops.findUnique({
      where: {
        id: review.workshop_id,
      },
    });
    if (workshop === null) {
      throw createError(400, WORKSHOP_NOT_EXISTS_ERROR_MESSAGE);
    }

    const user = await client.users.findUnique({
      where: {
        id: userUuid,
      },
    });
    if (user === null) {
      throw createError(400, USER_NOT_EXISTS_ERROR_MESSAGE);
    }

    const result = await prisma.reviews.create({
      data: { ...review, user_id: userUuid, reviewed_at: new Date() },
    });

    return result;
  });
}

export async function lambdaHandler(request) {
  const payload: Review = request.body;
  const userUuid = request.auth.payload.sub;

  const result = await createReview(payload, userUuid);

  return {
    statusCode: 200,
    body: JSON.stringify(result),
    headers: { "Content-Type": "application/json" },
  };
}

export const handler = middy()
  .use(jsonBodyParser())
  .use(httpHeaderNormalizer())
  .use(validator({ eventSchema: transpileSchema(createReviewSchema) }))
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
