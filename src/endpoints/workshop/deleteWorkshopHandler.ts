import type { UUID } from "node:crypto";

import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import createError from "http-errors";

import { PARAMETER_OF_WORKSHOP_UUID } from "@/constants/constants";
import {
  PRISMA_ERROR_CODE,
  WORKSHOP_NOT_EXISTS_ERROR_MESSAGE,
} from "@/constants/errorMessages";
import { middyAuthorized } from "@/middleware/middy/middyAuthorized";
import { deleteWorkShopDetailSchema } from "@/models/schemas";
import { deleteWorkshop } from "@/services/db/workshop/deleteWorkshop";

export async function lambdaHandler(request) {
  const workshopUuid: UUID = request.pathParameters[PARAMETER_OF_WORKSHOP_UUID];
  const userUuid = request.auth.payload.sub;

  const result = await deleteWorkshop(workshopUuid, userUuid).catch((err) => {
    console.warn(err);
    return err;
  });

  if (result instanceof Error) {
    if (
      result instanceof PrismaClientKnownRequestError &&
      result.code === PRISMA_ERROR_CODE.P2025
    ) {
      throw createError(400, WORKSHOP_NOT_EXISTS_ERROR_MESSAGE);
    }
    throw createError(500);
  }

  return {
    statusCode: 200,
    body: JSON.stringify(result),
    headers: { "Content-Type": "application/json" },
  };
}

export const handler = middyAuthorized(
  lambdaHandler,
  deleteWorkShopDetailSchema,
);
