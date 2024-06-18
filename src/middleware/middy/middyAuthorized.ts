import middy from "@middy/core";
import httpErrorHandler from "@middy/http-error-handler";
import httpHeaderNormalizer from "@middy/http-header-normalizer";
import jsonBodyParser from "@middy/http-json-body-parser";
import validator from "@middy/validator";
import { transpileSchema } from "@middy/validator/transpile";
import jwtAuthMiddleware, {
  EncryptionAlgorithms,
} from "middy-middleware-jwt-auth";

import { isTokenPayload, secret } from "@/authUtils/jwtUtil";

export function middyAuthorized(lambdaHandler, schema?) {
  return middy()
    .use(jsonBodyParser())
    .use(httpHeaderNormalizer())
    .use(validator({ eventSchema: transpileSchema(schema) }))
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
}
