import type { UUID } from "node:crypto";

import { PrismaClient } from "@prisma/client";

import { WORKSHOP_NOT_EXISTS_ERROR_MESSAGE } from "@/constants/errorMessages";

const prisma = new PrismaClient();

export async function listParticipants(workshopUuid: UUID, userUuid: UUID) {
  return prisma.$transaction(async (client) => {
    const workshop = await client.workshops.findUnique({
      where: {
        id: workshopUuid,
        user_id: userUuid,
        canceled_at: null,
      },
    });

    if (workshop === null) {
      throw new Error(WORKSHOP_NOT_EXISTS_ERROR_MESSAGE);
    }

    const result = await client.participations.findMany({
      where: {
        workshop_id: workshopUuid,
        canceled_at: null,
      },
      include: {
        users: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });
    const participants = result.map((participant) => ({
      name: participant.users.name,
      email: participant.users.email,
    }));
    return participants;
  });
}
