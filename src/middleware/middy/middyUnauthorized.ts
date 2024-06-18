import middy from "@middy/core";
import httpErrorHandler from "@middy/http-error-handler";
import jsonBodyParser from "@middy/http-json-body-parser";
import validator from "@middy/validator";
import { transpileSchema } from "@middy/validator/transpile";

export function middyUnauthorized(lambdaHandler, schema?) {
  return middy()
    .use(jsonBodyParser())
    .use(validator({ eventSchema: transpileSchema(schema) }))
    .use(httpErrorHandler())
    .handler(lambdaHandler);
}
