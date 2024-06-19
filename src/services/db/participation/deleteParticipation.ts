import type { UUID } from "node:crypto";

import { PrismaClient } from "@prisma/client";

import {
  WORKSHOP_PARTICIPANT_NOT_EXISTS_OR_CANCELED_ERROR_MESSAGE,
  WORKSHOP_PARTICIPANT_RECORD_CORRUPTED_ERROR_MESSAGE,
} from "@/constants/errorMessages";

const prisma = new PrismaClient();

export function deleteParticipation(workshopUuid: UUID, userUuid: UUID) {
  return prisma.$transaction(async (client) => {
    const participations = await client.participations.findMany({
      where: {
        user_id: userUuid,
        workshop_id: workshopUuid,
        canceled_at: null,
      },
    });

    if (participations.length === 0) {
      throw new Error(
        WORKSHOP_PARTICIPANT_NOT_EXISTS_OR_CANCELED_ERROR_MESSAGE,
      );
    }
    if (participations.length > 1) {
      throw new Error(WORKSHOP_PARTICIPANT_RECORD_CORRUPTED_ERROR_MESSAGE);
    }

    const result = await client.participations.update({
      where: {
        id: participations[0].id,
      },
      data: {
        canceled_at: new Date(),
      },
    });
    return result;
  });
}
