import type { UUID } from "node:crypto";

import { PrismaClient } from "@prisma/client";

import { POINT_FOR_HOST, POINT_FOR_PARTICIPANT } from "@/constants/constants";

const prisma = new PrismaClient();

export async function listPointReceivers() {
  const workshops = await prisma.workshops.findMany({
    where: {
      end_at: {
        lt: new Date(),
      },
      yumex_point_processed_at: null,
    },
    include: {
      users: {
        select: {
          email: true,
        },
      },
    },
  });

  const hostReceivers = workshops.map(
    (workshop) => [workshop.users.email, POINT_FOR_HOST as number] as const,
  );
  const workshopUuids = workshops.map((workshop) => workshop.id as UUID);

  const participations = await prisma.participations.findMany({
    where: {
      workshop_id: { in: workshopUuids },
    },
    include: {
      users: {
        select: {
          email: true,
        },
      },
    },
  });

  const participantReceivers = participations.map(
    (participation) =>
      [participation.users.email, POINT_FOR_PARTICIPANT as number] as const,
  );

  const receivers = hostReceivers.concat(participantReceivers);
  const entries = new Map(receivers);
  const point = Object.fromEntries(entries);

  return { workshopUuids, point };
}
