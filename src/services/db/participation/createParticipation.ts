import type { UUID } from "node:crypto";

import { PrismaClient } from "@prisma/client";

import { WORKSHOP_PARTICIPANT_DUPLICATED_ERROR_MESSAGE } from "@/constants/errorMessages";

const prisma = new PrismaClient();

/**
 * @throws {@link PrismaClientKnownRequestError}
 *  code: 'P2003', if user or workshop doesn't exists
 */
export function createParticipation(workshopUuid: UUID, userUuid: UUID) {
  return prisma.$transaction(async (client) => {
    const participations = await client.participations.findMany({
      where: {
        user_id: userUuid,
        workshop_id: workshopUuid,
        canceled_at: null,
      },
    });

    if (participations.length !== 0) {
      throw new Error(WORKSHOP_PARTICIPANT_DUPLICATED_ERROR_MESSAGE);
    }

    const result = await client.participations.create({
      data: {
        user_id: userUuid,
        workshop_id: workshopUuid,
        participation_at: new Date(),
      },
    });
    return result;
  });
}
