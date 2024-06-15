import type { UUID } from "node:crypto";

import middy from "@middy/core";
import httpErrorHandler from "@middy/http-error-handler";
import validator from "@middy/validator";
import { transpileSchema } from "@middy/validator/transpile";

import createError from "http-errors";

import { PARAMETER_OF_WORKSHOP_UUID } from "@/constants/constants";
import { WORKSHOP_NOT_EXISTS_ERROR_MESSAGE } from "@/constants/errorMessages";
import { getWorkShopDetailSchema } from "@/models/schemas";
import { getWorkShop } from "@/services/db/getWorkshop";

export async function lambdaHandler(request) {
  const workshopUuid: UUID = request.pathParameters[PARAMETER_OF_WORKSHOP_UUID];
  const result = await getWorkShop(workshopUuid).catch((err) => {
    console.warn(err);
    return err;
  });

  if (result instanceof Error) {
    throw result;
  }

  if (result === null) {
    throw createError(400, WORKSHOP_NOT_EXISTS_ERROR_MESSAGE);
  }

  return {
    statusCode: 200,
    body: JSON.stringify(result),
    headers: { "Content-Type": "application/json" },
  };
}

export const handler = middy()
  .use(validator({ eventSchema: transpileSchema(getWorkShopDetailSchema) }))
  .use(httpErrorHandler())
  .handler(lambdaHandler);
