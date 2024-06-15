import type { UUID } from "node:crypto";

import middy from "@middy/core";
import httpErrorHandler from "@middy/http-error-handler";
import httpHeaderNormalizer from "@middy/http-header-normalizer";
import validator from "@middy/validator";
import { transpileSchema } from "@middy/validator/transpile";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import createError from "http-errors";
import jwtAuthMiddleware, {
  EncryptionAlgorithms,
} from "middy-middleware-jwt-auth";

import { isTokenPayload, secret } from "@/authUtils/jwtUtil";
import { PARAMETER_OF_WORKSHOP_UUID } from "@/constants/constants";
import {
  API_KEY_AUTHENTICATION_FAILED_ERROR_MESSAGE,
  PRISMA_ERROR_CODE,
  WORKSHOP_NOT_EXISTS_ERROR_MESSAGE,
  WORKSHOP_PARTICIPANT_DUPLICATED_ERROR_MESSAGE,
} from "@/constants/errorMessages";
import { createParticipationSchema } from "@/models/schemas";
import { createParticipation } from "@/services/db/participation/createParticipation";

export async function lambdaHandler(request) {
  const workshopUuid: UUID = request.pathParameters[PARAMETER_OF_WORKSHOP_UUID];
  const userUuid = request.auth.payload.sub;

  const result = await createParticipation(workshopUuid, userUuid).catch(
    (err) => {
      console.warn(err);
      return err;
    },
  );

  if (result instanceof Error) {
    if (result.message === WORKSHOP_PARTICIPANT_DUPLICATED_ERROR_MESSAGE) {
      throw createError(400, WORKSHOP_PARTICIPANT_DUPLICATED_ERROR_MESSAGE);
    }
    if (
      result instanceof PrismaClientKnownRequestError &&
      result.code === PRISMA_ERROR_CODE.P2003 &&
      (result.meta?.field_name as string).includes("workshop_id_fkey")
    ) {
      throw createError(400, WORKSHOP_NOT_EXISTS_ERROR_MESSAGE);
    }
    if (
      result instanceof PrismaClientKnownRequestError &&
      result.code === PRISMA_ERROR_CODE.P2003 &&
      (result.meta?.field_name as string).includes("user_id_fkey")
    ) {
      throw createError(401, API_KEY_AUTHENTICATION_FAILED_ERROR_MESSAGE);
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
  .use(httpHeaderNormalizer())
  .use(
    validator({
      eventSchema: transpileSchema(createParticipationSchema),
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
