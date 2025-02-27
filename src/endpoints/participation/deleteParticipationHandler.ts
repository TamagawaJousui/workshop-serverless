import type { UUID } from "node:crypto";

import createError from "http-errors";

import { PARAMETER_OF_WORKSHOP_UUID } from "@/constants/constants";
import { WORKSHOP_PARTICIPANT_NOT_EXISTS_OR_CANCELED_ERROR_MESSAGE } from "@/constants/errorMessages";
import { middyWrapper } from "@/middleware/middy/middyWrapper";
import { deleteParticipationSchema } from "@/models/schemas";
import { deleteParticipation } from "@/services/db/participation/deleteParticipation";

export async function lambdaHandler(request) {
  const workshopUuid: UUID = request.pathParameters[PARAMETER_OF_WORKSHOP_UUID];
  const userUuid = request.auth.payload.sub;

  const result = await deleteParticipation(workshopUuid, userUuid).catch(
    (err) => {
      console.warn(err);
      return err;
    },
  );

  if (result instanceof Error) {
    if (
      result.message ===
      WORKSHOP_PARTICIPANT_NOT_EXISTS_OR_CANCELED_ERROR_MESSAGE
    ) {
      throw createError(
        400,
        WORKSHOP_PARTICIPANT_NOT_EXISTS_OR_CANCELED_ERROR_MESSAGE,
      );
    }
    throw result;
  }

  return {
    statusCode: 200,
    body: JSON.stringify(result),
    headers: { "Content-Type": "application/json" },
  };
}


export const handler = middyWrapper({lambdaHandler, schema: deleteParticipationSchema, parseBody : false, requireAuth: true});