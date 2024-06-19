import type { UUID } from "node:crypto";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * @throws {@link PrismaClientKnownRequestError}
 *  code: 'P2025', if workshop with correct user id and not been canceled doesn't exists
 */
export async function deleteWorkshop(workshopUuid: UUID, userUuid: UUID) {
  const result = await prisma.workshops.update({
    where: {
      id: workshopUuid,
      user_id: userUuid,
      start_at: {
        gt: new Date(),
      },
      canceled_at: null,
    },
    data: {
      canceled_at: new Date(),
    },
  });
  return result;
}
