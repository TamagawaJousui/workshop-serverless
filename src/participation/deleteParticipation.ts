import type { UUID } from "node:crypto";

import middy from "@middy/core";
import httpErrorHandler from "@middy/http-error-handler";
import httpHeaderNormalizer from "@middy/http-header-normalizer";
import validator from "@middy/validator";
import { transpileSchema } from "@middy/validator/transpile";
import { PrismaClient } from "@prisma/client";
import * as createError from "http-errors";
import jwtAuthMiddleware, {
  EncryptionAlgorithms,
} from "middy-middleware-jwt-auth";

import { isTokenPayload, secret } from "../authUtils/jwtUtil";
import { PARAMETER_OF_WORKSHOP_UUID } from "../constants/constants";
import {
  WORKSHOP_PARTICIPANT_NOT_EXISTS_OR_CANCELED_ERROR_MESSAGE,
  WORKSHOP_PARTICIPANT_RECORD_CORRUPTED_ERROR_MESSAGE,
} from "../constants/errorMessages";
import { deleteParticipationSchema } from "../constants/schemas";

const prisma = new PrismaClient();

function deleteParticipation(workshopUuid: UUID, userUuid: UUID) {
  return prisma.$transaction(async (client) => {
    const participationsInDb = await client.participations.findMany({
      where: {
        user_id: userUuid,
        workshop_id: workshopUuid,
        canceled_at: null,
      },
    });

    if (participationsInDb.length === 0) {
      throw createError(
        400,
        WORKSHOP_PARTICIPANT_NOT_EXISTS_OR_CANCELED_ERROR_MESSAGE,
      );
    }
    if (participationsInDb.length > 1) {
      throw new Error(WORKSHOP_PARTICIPANT_RECORD_CORRUPTED_ERROR_MESSAGE);
    }

    const result = await client.participations.update({
      where: {
        id: participationsInDb[0].id,
      },
      data: {
        canceled_at: new Date(),
      },
    });
    return result;
  });
}

export async function lambdaHandler(request) {
  const workshopUuid: UUID = request.pathParameters[PARAMETER_OF_WORKSHOP_UUID];
  const userUuid = request.auth.payload.sub;

  const result = await deleteParticipation(workshopUuid, userUuid);

  return {
    statusCode: 200,
    body: JSON.stringify(result),
    headers: { "Content-Type": "application/json" },
  };
}

export const handler = middy()
  .use(httpHeaderNormalizer())
  .use(
    validator({
      eventSchema: transpileSchema(deleteParticipationSchema),
    }),
  )
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
