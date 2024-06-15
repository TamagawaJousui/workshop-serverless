import type { UUID } from "node:crypto";

import middy from "@middy/core";
import httpErrorHandler from "@middy/http-error-handler";
import httpHeaderNormalizer from "@middy/http-header-normalizer";
import validator from "@middy/validator";
import { transpileSchema } from "@middy/validator/transpile";
import createError from "http-errors";
import jwtAuthMiddleware, {
  EncryptionAlgorithms,
} from "middy-middleware-jwt-auth";

import { isTokenPayload, secret } from "@/authUtils/jwtUtil";
import { PARAMETER_OF_WORKSHOP_UUID } from "@/constants/constants";
import { WORKSHOP_NOT_EXISTS_ERROR_MESSAGE } from "@/constants/errorMessages";
import { listParticipantsSchema } from "@/models/schemas";
import { listParticipants } from "@/services/db/participation/listParticipants";

export async function lambdaHandler(request) {
  const workshopUuid: UUID = request.pathParameters[PARAMETER_OF_WORKSHOP_UUID];
  const userUuid = request.auth.payload.sub;

  const result = await listParticipants(workshopUuid, userUuid).catch((err) => {
    console.warn(err);
    return err;
  });

  if (result instanceof Error) {
    if (result.message === WORKSHOP_NOT_EXISTS_ERROR_MESSAGE) {
      throw createError(400, WORKSHOP_NOT_EXISTS_ERROR_MESSAGE);
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
      eventSchema: transpileSchema(listParticipantsSchema),
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
