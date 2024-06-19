import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import createError from "http-errors";

import {
  API_KEY_AUTHENTICATION_FAILED_ERROR_MESSAGE,
  PRISMA_ERROR_CODE,
} from "@/constants/errorMessages";
import { middyWrapper } from "@/middleware/middy/middyWrapper";
import { addWorkshopSchema } from "@/models/schemas";
import {
  createWorkShop,
  type Workshop,
} from "@/services/db/workshop/createWorkshop";

export async function lambdaHandler(request) {
  const payload: Workshop = request.body;
  const userUuid = request.auth.payload.sub;

  const workshop = {
    ...payload,
    user_id: userUuid,
  };
  const result = await createWorkShop(workshop).catch((err) => {
    console.warn(err);
    return err;
  });

  if (result instanceof Error) {
    if (
      result instanceof PrismaClientKnownRequestError &&
      result.code === PRISMA_ERROR_CODE.P2003
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

export const handler = middyWrapper({lambdaHandler, schema: addWorkshopSchema, parseBody : true, requireAuth: true});