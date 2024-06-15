import middy from "@middy/core";
import httpErrorHandler from "@middy/http-error-handler";
import jsonBodyParser from "@middy/http-json-body-parser";
import validator from "@middy/validator";
import { transpileSchema } from "@middy/validator/transpile";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import createError from "http-errors";

import {
  PRISMA_ERROR_CODE,
  USER_EMAIL_DUPLICATED_ERROR_MESSAGE,
} from "@/constants/errorMessages";
import { addUserSchema } from "@/models/schemas";
import { createUser, type User } from "@/services/db/createUser";

export async function lambdaHandler(request) {
  const payload: User = request.body;
  const result = await createUser(payload).catch((err) => {
    console.warn(err);
    return err;
  });

  if (result instanceof Error) {
    if (
      result instanceof PrismaClientKnownRequestError &&
      result.code === PRISMA_ERROR_CODE.P2002
    ) {
      throw createError(400, USER_EMAIL_DUPLICATED_ERROR_MESSAGE);
    }
    throw result;
  }

  const response = (({ id, name, email }) => ({ id, name, email }))(result);
  return {
    statusCode: 200,
    body: JSON.stringify(response),
    headers: { "Content-Type": "application/json" },
  };
}

export const handler = middy()
  .use(jsonBodyParser())
  .use(validator({ eventSchema: transpileSchema(addUserSchema) }))
  .use(httpErrorHandler())
  .handler(lambdaHandler);
