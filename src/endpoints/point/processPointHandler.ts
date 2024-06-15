import middy from "@middy/core";
import httpErrorHandler from "@middy/http-error-handler";
import httpHeaderNormalizer from "@middy/http-header-normalizer";
import createError from "http-errors";
import jwtAuthMiddleware, {
  EncryptionAlgorithms,
} from "middy-middleware-jwt-auth";

import { isTokenPayload, secret } from "@/authUtils/jwtUtil";
import { USER_FORBIDDEN_ERROR_MESSAGE } from "@/constants/errorMessages";
import { adminEmail } from "@/env";
import { getUser } from "@/services/db/user/getUser";
import { listPointReceivers } from "@/services/point/listPointReceivers";
import { markPointProcessed } from "@/services/point/markPointProcessed";
import { processPoint } from "@/services/point/processPoint";

export async function lambdaHandler(request) {
  const userUuid = request.auth.payload.sub;
  const user = await getUser(userUuid);

  if (user?.email !== adminEmail) {
    throw createError(403, USER_FORBIDDEN_ERROR_MESSAGE);
  }

  const { workshopUuids, point } = await listPointReceivers();
  const processed = await processPoint(point);
  await markPointProcessed(workshopUuids);

  return {
    statusCode: 200,
    body: JSON.stringify(processed),
    headers: { "Content-Type": "application/json" },
  };
}

export const handler = middy()
  .use(httpHeaderNormalizer())
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
